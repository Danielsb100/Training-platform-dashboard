# Plano: Docs por Idioma + JWT Resilience + Redirect Inteligente

## Parte 1: Documentos Exclusivos por Idioma

### Mudança de Paradigma (baseado no seu feedback)

- ❌ ~~Documentos globais com opção de localizar~~ 
- ✅ Documentos agora se comportam **exatamente como vídeos e quizzes** — exclusivos por sessão de idioma
- Documentos existentes (com `languageSessionId = null`) serão tratados como pertencentes à **aba padrão (English/Base)**
- Ao editar o módulo: a aba de docs mostra apenas os documentos da sessão ativa
- Ao fazer upload: o documento é vinculado à sessão de idioma atual automaticamente

### Estado Atual vs Desejado

| Componente | Estado Atual | Estado Desejado |
|---|---|---|
| `formatModuleData()` | Não expõe `languageSessionId` nos docs | Expor `languageSessionId` |
| `_count` languageSessions | Conta apenas `videos` e `quizzes` | Contar também `documents` |
| `updateDocument()` | Só aceita `title` e `order` | Aceitar também `languageSessionId` |
| `handleDocUpload()` | Nunca envia `languageSessionId` | Enviar `currentLanguageSessionId` |
| `switchLanguageSession()` | Renderiza todos os docs sem filtro | Filtrar docs por `filterBySession()` |
| `loadModuleData()` | Renderiza docs sem filtro | Filtrar docs por `filterBySession()` |
| 3D World `openModuleSidebar()` | Docs não filtrados | Filtrar: sessão do aluno **OU** `null` (base) |

---

### Backend

#### [MODIFY] [moduleController.js](file:///d:/GitHub/Training-platform-dashboard/controllers/moduleController.js)

**`formatModuleData()`** (linhas 32-38): Adicionar `languageSessionId` ao map de documentos:
```diff
 documents: (module.documents || []).map(d => ({
     id: d.id,
     title: d.title,
     order: d.order,
     documentId: d.documentId,
-    type: d.document ? d.document.type : 'application/octet-stream'
+    type: d.document ? d.document.type : 'application/octet-stream',
+    languageSessionId: d.languageSessionId || null
 })).sort((a, b) => a.order - b.order),
```

**`getModuleById()`** (linha 199): Adicionar `documents: true` ao `_count`:
```diff
-_count: { select: { videos: true, quizzes: true } }
+_count: { select: { videos: true, quizzes: true, documents: true } }
```

#### [MODIFY] [contentController.js](file:///d:/GitHub/Training-platform-dashboard/controllers/contentController.js)

**`updateDocument()`** (linhas 164-189): Aceitar `languageSessionId` no body e incluir no update:
```diff
-const { title, order } = req.body;
+const { title, order, languageSessionId } = req.body;
 ...
-data: { title, order: parseInt(order) }
+data: {
+    title,
+    order: order !== undefined ? parseInt(order) : undefined,
+    languageSessionId: languageSessionId !== undefined
+        ? (languageSessionId !== null ? parseInt(languageSessionId) : null)
+        : undefined
+}
```

---

### Frontend: Course Builder (Admin)

#### [MODIFY] [module_manager.js](file:///d:/GitHub/Training-platform-dashboard/public/js/module_manager.js)

**`loadModuleData()`** (linhas 382-390): Filtrar documentos igual vídeos e quizzes:
```diff
-// Filter content by current session (videos and quizzes only — documents are shared globally)
+// Filter content by current session (videos, quizzes, AND documents)
 const filteredVideos = filterBySession(module.videos || []);
+const filteredDocs = filterBySession(module.documents || []);
 const filteredQuizzes = filterBySession(module.quizzes || (module.quiz ? [module.quiz] : []));

 renderVideos(filteredVideos);
-// Docs (shared across all sessions — no filtering)
-renderDocs(module.documents || []);
+renderDocs(filteredDocs);
 renderQuizzes(filteredQuizzes);
```

**`switchLanguageSession()`** (linha 549): Filtrar docs:
```diff
 renderVideos(filterBySession(module.videos || []));
-renderDocs(module.documents || []); // Documents are shared globally — no session filter
+renderDocs(filterBySession(module.documents || []));
 renderQuizzes(filterBySession(module.quizzes || []));
```

**`handleDocUpload()`** (linhas 1416-1419): Enviar `languageSessionId`:
```diff
-// Documents are shared globally across all language sessions — never send languageSessionId
-const docLinkBody = { documentId: docId, title: file.name };
+const docLinkBody = { documentId: docId, title: file.name };
+if (currentLanguageSessionId) docLinkBody.languageSessionId = currentLanguageSessionId;
```

---

### Frontend: 3D World (Viewer do Aluno)

#### [MODIFY] [main.js](file:///d:/GitHub/Training-platform-dashboard/public/world/main.js)

**`openModuleSidebar()`** (linhas 4310-4336): Filtrar documentos. No viewer, o aluno deve ver os docs da sua sessão + docs `null` (base/default):
```diff
-// Filter videos and quizzes by language session (documents are global, not filtered)
+// Filter videos, quizzes, AND documents by language session
 const filteredVideos = ...
+const filteredDocs = (module.documents || []).filter(d => {
+    if (activeSessionId === null) return !d.languageSessionId;
+    return d.languageSessionId === activeSessionId || !d.languageSessionId;
+});
 const filteredQuizzes = ...
+_filteredModuleDocs = filteredDocs;
 ...
-renderModuleDocs(module.documents);
+renderModuleDocs(filteredDocs);
```

> [!NOTE]
> No 3D World, o aluno verá: docs do seu idioma + docs da base (null). Isso é diferente do admin (que vê só o filtrado), porque no runtime o aluno não pode trocar de aba manualmente — então precisa ver o conteúdo base se não houver tradução.

**`getModuleMaterialGroups()`** (linha 4486): Usar filtrado:
```diff
-documents: Array.isArray(module?.documents) ? module.documents : [],
+documents: _filteredModuleDocs !== null ? _filteredModuleDocs : (Array.isArray(module?.documents) ? module.documents : []),
```

**`refreshModuleProgressSurfaces()`** (linha 4506): Usar filtrado:
```diff
-renderModuleDocs(currentModulePayload.documents || []);
+renderModuleDocs(_filteredModuleDocs !== null ? _filteredModuleDocs : (currentModulePayload.documents || []));
```

**Adicionar variável global** (próximo da linha 4480):
```diff
 let _filteredModuleVideos = null;
+let _filteredModuleDocs = null;
 let _filteredModuleQuizzes = null;
```

---

## Parte 2: Resiliência JWT pós-Deploy

### Diagnóstico
O problema é que durante deploys (~5-15s downtime), requests falham e o frontend mostra `alert()` ou trava. A solução é retry automático + banner de reconexão.

#### [MODIFY] [module_manager.js](file:///d:/GitHub/Training-platform-dashboard/public/js/module_manager.js)

**`apiCall()`** (linhas 7-40): Adicionar retry com backoff para erros de rede:
```javascript
async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
    const token = getAuthToken();
    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = 'login.html';
        throw new Error('No token');
    }

    const maxRetries = method === 'GET' ? 2 : 1;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            if (!isFormData) headers['Content-Type'] = 'application/json';

            const options = { method, headers };
            if (body) options.body = isFormData ? body : JSON.stringify(body);

            const res = await fetch(`${API_URL}${endpoint}`, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Request error');
            return data.data || data;
        } catch (err) {
            lastError = err;
            const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
            if (isNetworkError && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}
```

> [!WARNING]
> O retry é **conservador**: apenas 1 retry para mutations (POST/PUT/DELETE) e 2 para GETs. Isso evita duplicação de dados (ex: criar 2 quizzes iguais).

---

## Parte 3: Redirect Inteligente após Login

### Problema
Sequência atual:
1. Usuário não-logado acessa `viewer.html?id=2` (landing page do curso)
2. Clica em "Access Training" → redirecionado para `login.html?redirect=/viewer.html?id=2`
3. Faz login → volta para `viewer.html?id=2` (landing page) ← **sempre, mesmo se já for aluno**
4. Tem que clicar em "Access Training" de novo

### Solução
Na `login.html`, **após o login bem-sucedido**, se o `redirect` aponta para `viewer.html`, fazer uma verificação rápida de enrollment:

- Se o usuário **está matriculado** no curso → redirecionar para `course_content.html?id=X`
- Se **não está matriculado** → redirecionar para `viewer.html?id=X` (landing page, para pedir acesso)

#### [MODIFY] [login.html](file:///d:/GitHub/Training-platform-dashboard/public/login.html)

**Login success handler** (linhas 262-269): Adicionar lógica de verificação:
```diff
 const urlParams = new URLSearchParams(window.location.search);
 const redirectUrl = urlParams.get('redirect');
 
-if (redirectUrl && isValidRedirect(redirectUrl)) {
-    window.location.href = redirectUrl;
+if (redirectUrl && isValidRedirect(redirectUrl)) {
+    // Smart redirect: if heading to a landing page, check enrollment first
+    const viewerMatch = redirectUrl.match(/^\/viewer\.html\?id=(\d+)/);
+    if (viewerMatch) {
+        const courseId = viewerMatch[1];
+        try {
+            const checkRes = await fetch('/courses/' + courseId, {
+                headers: { 'Authorization': 'Bearer ' + result.token }
+            });
+            if (checkRes.ok) {
+                // User is enrolled — skip landing page, go to course
+                window.location.href = '/course_content.html?id=' + courseId;
+                return;
+            }
+        } catch (e) { /* ignore, fall through to normal redirect */ }
+    }
+    window.location.href = redirectUrl;
```

> [!NOTE]
> Esta verificação adiciona **1 request extra** ao fluxo de login (apenas quando vindo de landing page). Se falhar por qualquer motivo, cai no comportamento atual (redirecionar para viewer.html). É fail-safe.

---

## Verificação

### Testes Manuais — Documentos por Idioma
1. Abrir Course Builder → editar módulo → aba English: docs existentes devem aparecer
2. Trocar para outra aba (ex: Espanhol): docs deve estar vazia
3. Upload de documento na aba Espanhol → doc aparece na aba Espanhol, **não** na English
4. No 3D World com locale `es-ES`: ver docs do espanhol + docs base (null)
5. No 3D World com locale `en-US`: ver apenas docs da base (null)

### Testes Manuais — JWT Resilience
1. Fazer uma ação no Course Builder com servidor rodando → funciona normalmente
2. Simular falha (desligar servidor por 2s) → deve tentar retry sem crash

### Testes Manuais — Redirect Inteligente
1. Sem login → acessar `viewer.html?id=2` → clicar "Access Training" → login
2. Se **matriculado** no curso 2 → deve ir direto para `course_content.html?id=2`
3. Se **não matriculado** → deve ir para `viewer.html?id=2` (landing page)
