import os
import re

# 1. Update index.html
index_path = 'public/world/index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Make chat visible initially
html = html.replace('<div id="chat-history-container" class="hidden">', '<div id="chat-history-container">')
html = html.replace('<div id="chat-input-container" class="hidden">', '<div id="chat-input-container">')

# Remove settings gear
html = html.replace('<button id="btn-settings" class="sidebar-btn" title="Settings">⚙️</button>', '')

# Remove course-room-context (it spans multiple lines, safer to replace block or use regex)
html = re.sub(r'<div id="course-room-context".*?Ver\s*Landing Page</button>\s*</div>', '', html, flags=re.DOTALL)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update main.js
main_path = 'public/world/main.js'
with open(main_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Profile picture redirect and confirmation
old_profile = """        sidebarPic.onclick = () => {
            let dashboardUrl = AUTH_API.replace('/api', '') + '/dashboard.html';
            if (!dashboardUrl || dashboardUrl.startsWith('/dashboard.html')) {
                dashboardUrl = '/dashboard.html';
            }
            window.open(dashboardUrl, '_blank');
        };"""

new_profile = """        sidebarPic.onclick = () => {
            if (window.confirm('Go back to profile?')) {
                let profileUrl = AUTH_API.replace('/api', '') + '/profile.html';
                if (!profileUrl || profileUrl.startsWith('/profile.html')) {
                    profileUrl = '/profile.html';
                }
                window.location.href = profileUrl;
            }
        };"""
js = js.replace(old_profile, new_profile)

# Handle AI Tips and Notifications mutually exclusive
old_notif = """        btnToggleNotifications.addEventListener('click', () => {
            const worldOperationsCardElement = document.getElementById('world-operations-card');
            if (worldOperationsCardElement) {
                worldOperationsCardElement.classList.toggle('hidden');
                btnToggleNotifications.classList.toggle('active', !worldOperationsCardElement.classList.contains('hidden'));
            }
        });"""

new_notif = """        btnToggleNotifications.addEventListener('click', () => {
            const worldOperationsCardElement = document.getElementById('world-operations-card');
            const worldAiTipsCardElement = document.getElementById('world-ai-tips-card');
            if (worldOperationsCardElement) {
                worldOperationsCardElement.classList.toggle('hidden');
                btnToggleNotifications.classList.toggle('active', !worldOperationsCardElement.classList.contains('hidden'));
                if (!worldOperationsCardElement.classList.contains('hidden') && worldAiTipsCardElement) {
                    worldAiTipsCardElement.classList.add('hidden');
                    const btnToggleAiTips = document.getElementById('btn-toggle-ai-tips');
                    if (btnToggleAiTips) btnToggleAiTips.classList.remove('active');
                }
            }
        });"""
js = js.replace(old_notif, new_notif)

old_aitips = """        btnToggleAiTips.onclick = () => {
            const card = document.getElementById('world-ai-tips-card');
            if (card) {
                card.classList.toggle('hidden');
                btnToggleAiTips.classList.toggle('active', !card.classList.contains('hidden'));"""

new_aitips = """        btnToggleAiTips.onclick = () => {
            const card = document.getElementById('world-ai-tips-card');
            const worldOperationsCardElement = document.getElementById('world-operations-card');
            if (card) {
                card.classList.toggle('hidden');
                btnToggleAiTips.classList.toggle('active', !card.classList.contains('hidden'));
                if (!card.classList.contains('hidden') && worldOperationsCardElement) {
                    worldOperationsCardElement.classList.add('hidden');
                    const btnToggleNotifications = document.getElementById('btn-toggle-notifications');
                    if (btnToggleNotifications) btnToggleNotifications.classList.remove('active');
                }"""
js = js.replace(old_aitips, new_aitips)

# Fix keydown/keyup for chat movement
old_keydown = """window.addEventListener('keydown', (e) => {
    if (document.activeElement === emailInput || document.activeElement === passwordInput) return;
    if (document.activeElement === chatInput) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendChatMessage();
        } else if (e.key === 'Escape') {
            chatInput.blur();
        }
        return;
    }"""

new_keydown = """window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (document.activeElement === chatInput) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            } else if (e.key === 'Escape') {
                chatInput.blur();
            }
        }
        return;
    }"""
js = js.replace(old_keydown, new_keydown)

old_keyup = """window.addEventListener('keyup', (e) => {
    if (document.activeElement === emailInput || document.activeElement === passwordInput || document.activeElement === chatInput) return;"""

new_keyup = """window.addEventListener('keyup', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;"""
js = js.replace(old_keyup, new_keyup)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(js)

print('Scripts patched successfully.')
