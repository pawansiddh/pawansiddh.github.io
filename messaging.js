/* Secure, text-only Family Messaging. Cloud-linked accounts only. */
const FAMILY_CHAT_LIMIT = 2000;
const FAMILY_CHAT_RETENTION_DAYS = 30;
const SETTINGS_CATEGORY_KEY = 'studyTracker.settings.category';
let activeSettingsCategory = sessionStorage.getItem(SETTINGS_CATEGORY_KEY) || 'account';
let familyChatState = {
  user: null,
  rooms: [],
  roomId: null,
  participants: new Map(),
  messages: [],
  cleanup: null,
  subscription: null,
  badgeSubscription: null,
  sending: false
};

function familyChatEscape(value = '') {
  return typeof escapeHtml === 'function'
    ? escapeHtml(value)
    : String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function familyChatDate(value) {
  if (!value) return 'No messages yet';
  const date = new Date(value);
  const sameDay = date.toDateString() === new Date().toDateString();
  return date.toLocaleString(undefined, sameDay
    ? {hour:'numeric', minute:'2-digit'}
    : {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}

function familyChatCloudOnly() {
  return `<div class="family-chat-empty"><span>☁</span><h3>Cloud account required</h3><p>Family messages work only between linked Learner and Parent/Admin cloud accounts. Sign in with email or Google, then connect the accounts using a Family code.</p><button type="button" class="btn primary" onclick="setView('settings')">Open Family settings</button></div>`;
}

window.copyMessagingDatabaseFix = async () => {
  try {
    const response = await fetch('./supabase-messaging-hotfix.sql', {cache:'no-store'});
    if (!response.ok) throw Error('Database fix could not be loaded');
    await navigator.clipboard.writeText(await response.text());
    toast('Messaging database fix copied. Paste it into Supabase SQL Editor and select Run.');
  } catch (error) {
    toast(error.message || 'Open the database fix file from the project repository.');
  }
};

window.familyMessagingView = () => {
  setTimeout(() => familyMessagingBoot(false));
  return head(
    'Family messages',
    'Private text conversation with every Parent/Admin linked to this learner',
    '<button type="button" class="btn ghost" onclick="setView(\'settings\')">Messaging settings</button>'
  ) + '<div id="familyMessagingRoot" class="family-chat-root"><div class="empty">Opening secure messages…</div></div>';
};

window.familyOpenMessaging = () => {
  if (!isCloudParentSession?.()) return toast('Cross-device messages require a cloud Parent account');
  modal('<div class="family-message-modal"><span class="eyebrow">FAMILY STUDY MODE</span><h2>Family messages</h2><div id="familyMessagingRoot" class="family-chat-root parent-chat-root"><div class="empty">Opening secure messages…</div></div></div>');
  setTimeout(() => familyMessagingBoot(true));
};

async function familyMessagingUser() {
  if (!sb) return null;
  const {data, error} = await sb.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function familyMessagingBoot(parentMode = false) {
  const root = document.querySelector('#familyMessagingRoot');
  if (!root) return;
  familyMessagingStopRoomSubscription();
  const user = await familyMessagingUser();
  if (!user || (!cloudUser && !isCloudParentSession?.())) {
    root.innerHTML = familyChatCloudOnly();
    return;
  }
  familyChatState.user = user;
  root.innerHTML = '<div class="empty">Loading linked family rooms…</div>';
  const cleanup = await sb.rpc('cleanup_family_chat');
  if (!cleanup.error) familyChatState.cleanup = cleanup.data;
  const {data, error} = await sb.rpc('family_chat_list_rooms');
  if (error) {
    const ambiguous = /learner_id.*ambiguous/i.test(error.message || '');
    root.innerHTML = `<div class="family-chat-empty"><span>!</span><h3>${ambiguous?'One-time messaging database update required':'Messaging is not ready'}</h3><p>${ambiguous?'The installed chat function is an older version. Copy the repaired function below and run it once in the Supabase SQL Editor.':familyChatEscape(error.message)}</p>${ambiguous?'<div class="family-chat-fix-actions"><button type="button" class="btn primary" onclick="copyMessagingDatabaseFix()">Copy SQL fix</button><a class="btn ghost" href="supabase-messaging-hotfix.sql" download>Download SQL fix</a></div>':'<small>Run the current Supabase Family schema, then refresh this page.</small>'}</div>`;
    return;
  }
  familyChatState.rooms = data || [];
  if (!familyChatState.rooms.length) {
    root.innerHTML = `<div class="family-chat-empty"><span>✉</span><h3>No linked family yet</h3><p>${parentMode ? 'Generate a Family code and ask a Learner to enter it in Settings.' : 'Ask a Parent/Admin to generate a Family code, then enter it in Settings → Family access.'}</p><small>Messages begin after the cloud accounts are linked.</small></div>`;
    familyMessagingPaintBadge(0);
    return;
  }
  if (!familyChatState.rooms.some(room => room.room_id === familyChatState.roomId)) {
    familyChatState.roomId = familyChatState.rooms[0].room_id;
  }
  root.innerHTML = `<div class="family-chat-layout">
    <aside class="family-room-panel">
      <div class="family-room-heading"><div><strong>Conversations</strong><small>Linked family only</small></div><button type="button" class="mini-btn" title="Refresh" onclick="familyMessagingReload()">↻</button></div>
      <div id="familyRoomList" class="family-room-list"></div>
      <div class="family-retention-mini"><b>Text only</b><span>Automatic 30-day deletion</span></div>
    </aside>
    <section id="familyChatPane" class="family-chat-pane"><div class="empty">Loading conversation…</div></section>
  </div>`;
  familyMessagingPaintRooms();
  await familyMessagingOpenRoom(familyChatState.roomId);
}

function familyMessagingPaintRooms() {
  const list = document.querySelector('#familyRoomList');
  if (!list) return;
  list.innerHTML = familyChatState.rooms.map(room => {
    const unread = Number(room.unread_count || 0);
    return `<button type="button" class="family-room ${room.room_id === familyChatState.roomId ? 'active' : ''}" onclick="familyMessagingOpenRoom('${room.room_id}')">
      <span class="family-room-avatar">${familyChatEscape((room.learner_name || 'L')[0].toUpperCase())}</span>
      <span><strong>${familyChatEscape(room.learner_name || 'Learner')}</strong><small>${room.participant_count} member${Number(room.participant_count) === 1 ? '' : 's'} · ${familyChatDate(room.last_message_at)}</small></span>
      ${unread ? `<b>${unread > 99 ? '99+' : unread}</b>` : ''}
    </button>`;
  }).join('');
  familyMessagingPaintBadge(familyChatState.rooms.reduce((sum, room) => sum + Number(room.unread_count || 0), 0));
}

window.familyMessagingOpenRoom = async roomId => {
  familyChatState.roomId = roomId;
  familyMessagingPaintRooms();
  const pane = document.querySelector('#familyChatPane');
  if (!pane) return;
  pane.innerHTML = '<div class="empty">Loading messages…</div>';
  const [participants, messages] = await Promise.all([
    sb.rpc('family_chat_participants', {p_room_id: roomId}),
    sb.from('family_chat_messages')
      .select('id,room_id,sender_id,body,created_at,edited_at,expires_at')
      .eq('room_id', roomId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', {ascending:true})
      .limit(200)
  ]);
  if (participants.error || messages.error) {
    pane.innerHTML = `<div class="empty">${familyChatEscape(participants.error?.message || messages.error?.message || 'Messages could not be loaded')}</div>`;
    return;
  }
  familyChatState.participants = new Map((participants.data || []).map(person => [person.user_id, person]));
  familyChatState.messages = messages.data || [];
  familyMessagingPaintConversation();
  await sb.rpc('family_chat_mark_read', {p_room_id: roomId});
  const room = familyChatState.rooms.find(item => item.room_id === roomId);
  if (room) room.unread_count = 0;
  familyMessagingPaintRooms();
  familyMessagingSubscribe(roomId);
};

function familyMessagingPaintConversation() {
  const pane = document.querySelector('#familyChatPane');
  if (!pane) return;
  const room = familyChatState.rooms.find(item => item.room_id === familyChatState.roomId);
  const participants = [...familyChatState.participants.values()];
  const cleanup = familyChatState.cleanup;
  const databaseUsage = cleanup && Number.isFinite(Number(cleanup.database_percent))
    ? `${Number(cleanup.database_percent).toFixed(1)}% database used`
    : 'storage safeguard active';
  pane.innerHTML = `<header class="family-chat-header">
      <div><strong>${familyChatEscape(room?.learner_name || 'Family conversation')}</strong><small>${participants.map(person => familyChatEscape(person.display_name)).join(', ')}</small></div>
      <span>${participants.length} member${participants.length === 1 ? '' : 's'}</span>
    </header>
    <div class="family-retention-banner"><span>♻</span><p><strong>Private text only.</strong> Messages are permanently deleted after ${FAMILY_CHAT_RETENTION_DAYS} days. Oldest messages may be removed sooner if the database reaches 75% of its free quota.</p><small>${familyChatEscape(databaseUsage)}</small></div>
    <div id="familyMessageList" class="family-message-list">${familyChatState.messages.length ? familyChatState.messages.map(familyMessageMarkup).join('') : '<div class="family-chat-empty compact"><span>✉</span><h3>Start the conversation</h3><p>Send a study update, reminder or question to your linked family.</p></div>'}</div>
    <div class="family-compose">
      <textarea id="familyMessageInput" maxlength="${FAMILY_CHAT_LIMIT}" rows="2" placeholder="Write a message…" oninput="familyMessagingCount(this)" onkeydown="familyMessagingKeydown(event)"></textarea>
      <div><small id="familyMessageCount">0 / ${FAMILY_CHAT_LIMIT}</small><button type="button" class="btn primary" onclick="familyMessagingSend()">Send</button></div>
    </div>`;
  const list = document.querySelector('#familyMessageList');
  if (list) list.scrollTop = list.scrollHeight;
}

function familyMessageMarkup(message) {
  const own = message.sender_id === familyChatState.user?.id;
  const person = familyChatState.participants.get(message.sender_id);
  const editable = own && Date.now() - new Date(message.created_at).getTime() < 15 * 60 * 1000;
  return `<article class="family-message ${own ? 'own' : ''}">
    <div class="family-message-meta"><strong>${own ? 'You' : familyChatEscape(person?.display_name || 'Family member')}</strong><span>${familyChatDate(message.created_at)}${message.edited_at ? ' · edited' : ''}</span></div>
    <p>${familyChatEscape(message.body).replace(/\n/g, '<br>')}</p>
    ${own ? `<div class="family-message-actions">${editable ? `<button type="button" onclick="familyMessagingEdit('${message.id}')">Edit</button>` : ''}<button type="button" onclick="familyMessagingDelete('${message.id}')">Delete</button></div>` : ''}
  </article>`;
}

window.familyMessagingCount = input => {
  const count = document.querySelector('#familyMessageCount');
  if (count) count.textContent = `${input.value.length} / ${FAMILY_CHAT_LIMIT}`;
};

window.familyMessagingKeydown = event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    familyMessagingSend();
  }
};

window.familyMessagingSend = async () => {
  const input = document.querySelector('#familyMessageInput');
  const body = input?.value.trim();
  if (!body || familyChatState.sending) return;
  if (body.length > FAMILY_CHAT_LIMIT) return toast(`Messages are limited to ${FAMILY_CHAT_LIMIT} characters`);
  familyChatState.sending = true;
  const button = document.querySelector('.family-compose .btn');
  if (button) { button.disabled = true; button.textContent = 'Sending…'; }
  const {error} = await sb.from('family_chat_messages').insert({
    room_id: familyChatState.roomId,
    sender_id: familyChatState.user.id,
    body
  });
  familyChatState.sending = false;
  if (button) { button.disabled = false; button.textContent = 'Send'; }
  if (error) return toast(error.message || 'Message could not be sent');
  input.value = '';
  familyMessagingCount(input);
  await sb.rpc('cleanup_family_chat');
  await familyMessagingLoadMessages();
};

window.familyMessagingEdit = async messageId => {
  const message = familyChatState.messages.find(item => item.id === messageId);
  if (!message) return;
  const body = prompt('Edit message (available for 15 minutes after sending):', message.body);
  if (body === null) return;
  const clean = body.trim();
  if (!clean || clean.length > FAMILY_CHAT_LIMIT) return toast(`Enter 1–${FAMILY_CHAT_LIMIT} characters`);
  const {error} = await sb.from('family_chat_messages').update({body: clean}).eq('id', messageId);
  if (error) return toast(error.message || 'Message could not be edited');
  await familyMessagingLoadMessages();
};

window.familyMessagingDelete = async messageId => {
  if (!confirm('Permanently delete this message now?')) return;
  const {error} = await sb.from('family_chat_messages').delete().eq('id', messageId);
  if (error) return toast(error.message || 'Message could not be deleted');
  await familyMessagingLoadMessages();
};

async function familyMessagingLoadMessages() {
  const roomId = familyChatState.roomId;
  if (!roomId) return;
  const {data, error} = await sb.from('family_chat_messages')
    .select('id,room_id,sender_id,body,created_at,edited_at,expires_at')
    .eq('room_id', roomId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', {ascending:true})
    .limit(200);
  if (error) return;
  familyChatState.messages = data || [];
  familyMessagingPaintConversation();
  await sb.rpc('family_chat_mark_read', {p_room_id: roomId});
};

function familyMessagingSubscribe(roomId) {
  familyMessagingStopRoomSubscription();
  familyChatState.subscription = sb.channel(`family-chat-${roomId}`)
    .on('postgres_changes', {event:'*', schema:'public', table:'family_chat_messages', filter:`room_id=eq.${roomId}`}, async payload => {
      if (payload.eventType === 'INSERT' && payload.new?.sender_id !== familyChatState.user?.id) familyMessageBeep();
      await familyMessagingLoadMessages();
      await familyMessagingRefreshBadge();
    })
    .subscribe();
}

function familyMessagingStopRoomSubscription() {
  if (familyChatState.subscription && sb) sb.removeChannel(familyChatState.subscription);
  familyChatState.subscription = null;
}

window.familyMessagingReload = () => familyMessagingBoot(Boolean(document.querySelector('.parent-chat-root')));

function familyMessageBeep() {
  if (!familyData?.settings?.messageSound) return;
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.frequency.value = 680;
    gain.gain.setValueAtTime(.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .12);
    oscillator.start(); oscillator.stop(context.currentTime + .12);
  } catch {}
}

function familyMessagingPaintBadge(total) {
  const visible = total > 0 && familyData?.settings?.messageNotifications !== false;
  document.querySelectorAll('#messageBadge,#floatingMessageBadge').forEach(badge => {
    badge.textContent = total > 99 ? '99+' : String(total);
    badge.classList.toggle('hidden', !visible);
  });
  document.querySelector('#floatingMessages')?.classList.toggle('has-unread', visible);
}

window.familyMessagingRefreshBadge = async () => {
  const user = await familyMessagingUser();
  if (!user) return familyMessagingPaintBadge(0);
  const {data, error} = await sb.rpc('family_chat_list_rooms');
  if (error) return;
  const rooms = data || [];
  familyMessagingPaintBadge(rooms.reduce((sum, room) => sum + Number(room.unread_count || 0), 0));
  if (!familyChatState.badgeSubscription) {
    familyChatState.badgeSubscription = sb.channel(`family-chat-badge-${user.id}`)
      .on('postgres_changes', {event:'INSERT', schema:'public', table:'family_chat_messages'}, payload => {
        if (payload.new?.sender_id !== user.id && (typeof viewName === 'undefined' || viewName !== 'messages')) familyMessageBeep();
        setTimeout(familyMessagingRefreshBadge, 100);
      })
      .subscribe();
  }
};

function familyMessagingSettingsCard() {
  const settings = familyData.settings;
  return `<section class="card"><div class="card-title"><h3>Messaging & privacy</h3><span>Text only</span></div>
    <p class="task-meta">Secure messages are available only to cloud accounts joined by a Family link. Voice, video, files and public messaging are disabled.</p>
    <div class="setting-row"><span>Unread message badge</span><button class="toggle ${settings.messageNotifications ? 'on' : ''}" onclick="setFamilySetting('messageNotifications',!${settings.messageNotifications});render()"></button></div>
    <div class="setting-row"><span>New message sound</span><button class="toggle ${settings.messageSound ? 'on' : ''}" onclick="setFamilySetting('messageSound',!${settings.messageSound});render()"></button></div>
    <div class="retention-settings"><b>Automatic retention</b><span>Permanent deletion after 30 days</span><span>Oldest messages removed earlier at 75% database use</span></div>
    <div class="modal-actions"><button type="button" class="btn primary" onclick="setView('messages')">Open messages</button></div>
  </section>`;
}

function familyManualSettingsCard() {
  return `<section class="card"><div class="card-title"><h3>Help & user manual</h3><span>Complete guide</span></div><p class="task-meta">Read setup, planning, Job Tracker, Family linking, Parent monitoring, messaging, privacy, deletion and troubleshooting instructions.</p><div class="modal-actions"><button type="button" class="btn ghost" onclick="loginFaqModal()">Login FAQ</button><button type="button" class="btn primary" onclick="setView('help')">Open full manual</button></div></section>`;
}

window.enhanceSettingsNavigation = () => {
  const grid = document.querySelector('.settings-grid');
  if (!grid || grid.closest('.settings-shell')) return;
  const appearanceCard = [...grid.children].find(card => /Appearance/.test(card.querySelector('h3')?.textContent || ''));
  if (appearanceCard && typeof appearanceSettingsMarkup === 'function') appearanceCard.innerHTML = appearanceSettingsMarkup();
  const categoryFor = title => {
    if (/Profile/.test(title)) return 'account';
    if (/Workspace/.test(title)) return 'workspaces';
    if (/Appearance/.test(title)) return 'appearance';
    if (/Sound/.test(title)) return 'notifications';
    if (/Daily briefing/.test(title)) return 'briefing';
    if (/Voice/.test(title)) return 'voice';
    if (/Family access|Activity privacy/.test(title)) return 'family';
    if (/Messaging/.test(title)) return 'messaging';
    if (/import|export/i.test(title)) return 'data';
    if (/Help/.test(title)) return 'help';
    return 'security';
  };
  [...grid.children].forEach(card => card.dataset.settingCategory = categoryFor(card.querySelector('h3')?.textContent || ''));
  const categories = [
    ['account','Profile & account','♙'],['appearance','Appearance','◐'],['notifications','Notifications','♢'],
    ['briefing','Daily briefing popup','☀'],['voice','Voice & accessibility','◖'],['workspaces','Workspaces','▦'],
    ['family','Family & Parent controls','⌂'],['messaging','Messaging & privacy','✉'],['data','Import / export','⇄'],
    ['security','Security & danger zone','◇'],['help','Help & user manual','?']
  ];
  const shell = document.createElement('div');
  shell.className = 'settings-shell';
  const aside = document.createElement('aside');
  aside.className = 'settings-sidebar card';
  aside.innerHTML = `<label class="settings-search">⌕<input placeholder="Search settings" aria-label="Search settings"></label><nav>${categories.map(([key,label,icon], index) => `<button type="button" data-setting-nav="${key}" class="${index ? '' : 'active'}"><span>${icon}</span>${label}</button>`).join('')}</nav>`;
  grid.parentNode.insertBefore(shell, grid);
  shell.append(aside, grid);
  const showCategory = key => {
    activeSettingsCategory = categories.some(([category]) => category === key) ? key : 'account';
    sessionStorage.setItem(SETTINGS_CATEGORY_KEY, activeSettingsCategory);
    aside.querySelectorAll('[data-setting-nav]').forEach(button => button.classList.toggle('active', button.dataset.settingNav === key));
    [...grid.children].forEach(card => card.classList.toggle('setting-hidden', card.dataset.settingCategory !== key));
  };
  aside.querySelectorAll('[data-setting-nav]').forEach(button => button.onclick = () => {
    aside.querySelector('input').value = '';
    showCategory(button.dataset.settingNav);
  });
  aside.querySelector('input').oninput = event => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) return showCategory(aside.querySelector('[data-setting-nav].active')?.dataset.settingNav || 'account');
    [...grid.children].forEach(card => card.classList.toggle('setting-hidden', !card.textContent.toLowerCase().includes(query)));
  };
  showCategory(activeSettingsCategory);
};

function addMessagingToManual(html) {
  const nav = `<button onclick="scrollManual('extension')">Browser extension<span>→</span></button><button onclick="scrollManual('storage')">Documents & storage<span>→</span></button><button onclick="scrollManual('messaging')">Family messaging<span>→</span></button>`;
  html = html.replace('</aside><div class="manual-content">', `${nav}</aside><div class="manual-content">`);
  html = html.replace('Family activity or settings', 'Family activity, messages or settings');
  html = html.replace('change theme, completion sound and notifications.', 'choose an optimized theme, text style, text size and custom login background; also change completion sound and notifications.');
  const components = [
    ['setup','Login & accounts'],['daily','Dashboard'],['daily','Daily briefing'],['subjects','Subjects'],['subjects','Modules & topics'],
    ['planning','Tasks'],['planning','Calendar'],['planning','Today plan'],['notes','Notes'],['notes','Study timer'],['jobs','Job Tracker'],
    ['extension','Browser extension'],['storage','Documents & storage'],['workspaces','Settings'],['workspaces','Workspaces'],['family','Parent portal'],
    ['family','Activity monitoring'],['messaging','Messages'],['transfer','Import / export'],['security','Sign out & deletion']
  ];
  const directory = `<div id="manualSearchStatus" class="manual-search-status" role="status"></div><div class="manual-component-directory"><strong>All components</strong><div>${components.map(([id,label])=>`<button type="button" onclick="scrollManual('${id}')">${label}</button>`).join('')}</div></div>`;
  html = html.replace('</label><div class="manual-layout">', `</label>${directory}<div class="manual-layout">`);
  const extension = manualSection('extension','12','Browser extension: install, capture and troubleshoot','Capture LinkedIn, Indeed, Naukri and career-page jobs into a review draft.',`<ol><li>Open <strong>Job Tracker</strong> and select <strong>Browser extension</strong> to download <code>study-tracker-job-capture.zip</code>.</li><li>Extract the ZIP. Open <code>chrome://extensions</code> or <code>edge://extensions</code>, enable <strong>Developer mode</strong>, select <strong>Load unpacked</strong>, and choose the extracted <code>extension</code> folder.</li><li>Open the complete job-posting page on LinkedIn, Indeed, Naukri or a company career site. Select the extension icon, then <strong>Capture job</strong>.</li><li>The extension reads the visible company, role, location, posting URL and job description only after you click Capture. It briefly stores the draft in browser storage and opens Study Tracker.</li><li>Study Tracker always opens a review form. Correct missing or inaccurate fields, choose a status, add documents, then select <strong>Save application</strong>.</li><li>The extension does not apply for jobs, submit forms, bypass a portal login, collect passwords or save a record without your review.</li></ol><div class="faq-list"><details><summary>The extension says no job details were found</summary><p>Open the full job-details page—not a search-results list—refresh that tab, and capture again. Some portals load the description only after expanding it.</p></details><details><summary>It opens Study Tracker but no review form appears</summary><p>Refresh Study Tracker, confirm the extension is version 1.0.1, then reload the job tab after installing or updating the extension.</p></details><details><summary>Can it capture protected browser pages?</summary><p>No. Chrome settings, extension-store pages, PDFs opened by the browser and other protected URLs cannot be read. Use the actual job webpage or paste the JD manually.</p></details></div>`);
  const storage = manualSection('storage','13','Resumes, JDs, cover letters and storage','Understand exactly where job documents are stored.',`<ul><li>The main Supabase Postgres database stores only the application record and document metadata such as name, size and storage path.</li><li>For a cloud user, the actual PDF, DOCX or TXT bytes are uploaded to the private <strong>job-documents</strong> Supabase Storage bucket when it is available.</li><li>If cloud upload is unavailable, the file falls back to this browser’s IndexedDB. A local fallback remains only on the device where it was uploaded and cannot be downloaded from another device.</li><li>Resume, cover-letter and JD uploads are limited to 10 MB each. Pasted JD text is part of the application record rather than a file attachment.</li><li>Subject import/export and Job CSV export never include attachment bytes.</li><li>Moving attachments to Google Drive or another provider requires a separate provider connection and migration. Study Tracker does not silently copy existing documents to an external account.</li></ul>`);
  const messaging = manualSection('messaging','14','Family messaging and automatic deletion','Private text updates for linked Learners and Parents.',`<ul><li>Open Messages using the floating envelope button at the lower-right. A red counter means unread messages are waiting.</li><li>Messaging works only for cloud Learner and Parent/Admin accounts connected with a Family code. Local-only accounts cannot message across devices.</li><li>Each Learner has one private family room. Every currently linked Parent/Admin can participate; a Parent linked to multiple learners sees one room per learner.</li><li>Messages are text only, with a maximum of 2,000 characters. Voice notes, video, file attachments and public conversations are not stored.</li><li>Every message is permanently deleted after 30 days. The sender may delete it sooner, and may edit their own text for 15 minutes.</li><li>If the Supabase database reaches 75% of the free 500 MB quota, the oldest messages more than one day old are deleted earlier. This is irreversible and protects the rest of Study Tracker from reaching the database cap.</li><li>Family messages are never included in Subject import/export, Job CSV export, or workspace transfers.</li></ul>`);
  return html.replace(/<\/div><\/div>$/, `${extension}${storage}${messaging}</div></div>`);
}

const MANUAL_ALIASES = {
  setup:'login signin signup register google password pin account learner parent role authentication',
  daily:'dashboard home analytics chart progress greeting popup welcome briefing today due upcoming notification',
  subjects:'subject course syllabus module chapter topic lesson progress status deadline',
  planning:'task todo calendar calander event schedule today plan tomorrow future due followup',
  notes:'note notebook editor timer stopwatch focus pomodoro study time clock streak',
  jobs:'job tracker application carrer career company role applied interview resume cover letter jd description status sort filter csv',
  extension:'browser chrome edge extension extention linkedin indeed naukri capture plugin zip load unpacked developer mode',
  storage:'document attachment file pdf docx txt resume cover letter jd storage bucket cloud indexeddb local drive gdrive r2 download upload',
  workspaces:'setting settings theme appearance sound voice workspace archive profile notification briefing popup',
  family:'family parent admin child learner linking code monitor activity screen changes portal privacy',
  transfer:'import export json sample template subject transfer csv',
  security:'security signout logout delete account permanent session password profile',
  faq:'faq question help problem troubleshoot issue',
  messaging:'message messages chat chatbot conversation unread badge red indicator retention delete 30 days family text'
};

function manualNormalize(value='') {
  return String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();
}

function manualDistance(a,b) {
  const row=Array.from({length:b.length+1},(_,index)=>index);
  for(let i=1;i<=a.length;i++){
    let previous=row[0];row[0]=i;
    for(let j=1;j<=b.length;j++){
      const saved=row[j];
      row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));
      previous=saved;
    }
  }
  return row[b.length];
}

function manualTokenMatches(term,words) {
  if(words.some(word=>word===term||word.includes(term)||term.includes(word)))return true;
  if(term.length<4)return false;
  const allowance=term.length>=8?2:1;
  return words.some(word=>Math.abs(word.length-term.length)<=allowance&&manualDistance(term,word)<=allowance);
}

function filterManualComponents(query) {
  const normalized=manualNormalize(query),terms=normalized.split(' ').filter(Boolean),sections=[...document.querySelectorAll('.manual-section')];
  let matches=0,only=null;
  sections.forEach(section=>{
    const id=section.id.replace('manual-',''),haystack=manualNormalize(`${section.innerText} ${MANUAL_ALIASES[id]||''}`),words=haystack.split(' ');
    const matched=!normalized||haystack.includes(normalized)||terms.every(term=>manualTokenMatches(term,words));
    section.hidden=!matched;
    if(matched&&normalized){section.open=true;matches++;only=section}
  });
  const status=document.querySelector('#manualSearchStatus');
  if(status)status.textContent=!normalized?'':matches?`${matches} manual section${matches===1?'':'s'} found for “${query}”.`:`No manual section found for “${query}”. Try a component name such as calendar, extension, resume, parent or messages.`;
  if(matches===1&&only)setTimeout(()=>only.scrollIntoView({behavior:'smooth',block:'nearest'}),80);
}

document.addEventListener('DOMContentLoaded', () => {
  const baseSettings = settings;
  settings = () => baseSettings().replace(/<\/div>$/, familyMessagingSettingsCard() + familyManualSettingsCard() + '</div>');
  const baseHelpView = helpView;
  helpView = () => addMessagingToManual(baseHelpView());
  window.filterManual = filterManualComponents;
  const floating = document.querySelector('#floatingMessages');
  if(floating)floating.onclick=()=>typeof isParentSession==='function'&&isParentSession()?familyOpenMessaging():setView('messages');
  document.querySelector('#modal')?.addEventListener('close', () => {
    if (document.querySelector('.parent-chat-root')) familyMessagingStopRoomSubscription();
  });
});
