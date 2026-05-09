const fs = require('fs');
let c = fs.readFileSync('templates.js', 'utf8');

const btnHTML = `\n                        <div class="editable-text btn-subscribe" style="display:inline-block; padding:15px 30px; background:#cf982e; color:#fff; font-weight:bold; border-radius:30px; margin-left:15px; cursor:pointer;" onclick="alert('Inscrito com sucesso no curso!')">Inscrever-se no Curso</div>`;

c = c.replace(/Talk to an Expert<\/div>/g, 'Talk to an Expert</div>' + btnHTML);
c = c.replace(/Contact Me<\/div>/g, 'Contact Me</div>' + btnHTML);
c = c.replace(/Join the Movement<\/div>/g, 'Join the Movement</div>' + btnHTML);
c = c.replace(/Start Project<\/div>/g, 'Start Project</div>' + btnHTML);

fs.writeFileSync('templates.js', c);
console.log("Updated templates!");
