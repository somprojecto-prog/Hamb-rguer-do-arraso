# Hambúrguer do Arraso — Plataforma de E-commerce

Este projeto tem duas interfaces **completamente separadas**:

- **Site do cliente** (pasta principal): página inicial, menu, carrinho, checkout, conta, encomendas, favoritos, reservas.
- **Painel do gestor** (pasta `/manager`): só acessível a contas com o papel `admin`. Produtos, encomendas, reservas, clientes e configuração.

A separação é real, não só visual: as regras de acesso estão definidas **dentro da base de dados** (Supabase, com Row Level Security). Mesmo que alguém tente contornar o site e falar diretamente com a base de dados, as regras continuam a impedir um cliente normal de mexer em produtos, preços ou encomendas de outras pessoas.

---

## Passo 1 — Criar o projeto Supabase (grátis)

1. Vai a **[supabase.com](https://supabase.com)** e cria conta.
2. Cria um **New Project** (escolhe uma senha forte para a base de dados — guarda-a nalgum lugar seguro, não é a mesma senha do teu login).
3. Espera 1–2 minutos até o projeto ficar pronto.

## Passo 2 — Criar as tabelas e as regras de segurança

1. No painel do Supabase, vai a **SQL Editor** → **New query**.
2. Abre o ficheiro `supabase-schema.sql` (está aqui ao lado), copia tudo e cola no editor.
3. Clica em **Run**. Isto cria todas as tabelas, as regras de segurança, e alguns produtos de exemplo.

## Passo 3 — Ligar o site à tua base de dados

1. No Supabase, vai a **Project Settings → API**.
2. Copia o **Project URL** e a chave **anon public**.
3. Abre o ficheiro `assets/supabase-config.js` e cola os dois valores nos campos indicados.

*(A "anon key" é pública por natureza — o Supabase foi desenhado para isto. Quem protege os dados a sério são as regras de segurança do Passo 2, não o segredo desta chave.)*

## Passo 4 — Criar a tua conta de administrador

O sistema não permite criar contas de admin diretamente — por segurança, tens de:

1. Abre `registo.html` (o registo normal do site) e cria uma conta com:
   - E-mail: `somplataforma@gmail.com`
   - Senha: `apenasom`
2. No Supabase, vai a **Table Editor → profiles**.
3. Encontra a linha com esse e-mail associado (o nome que puseste no registo) e muda a coluna `role` de `cliente` para `admin`.
4. Pronto — agora consegues entrar em `manager/login.html` com essas credenciais.

⚠️ Depois de testares, recomendo mudares a senha para uma mais forte, diretamente no Supabase (**Authentication → Users**).

## Passo 5 — Publicar no GitHub Pages ou Render

**GitHub Pages:**
1. Cria um repositório novo no GitHub e envia todos estes ficheiros (mantendo a estrutura de pastas).
2. Vai a **Settings → Pages** do repositório, escolhe a branch principal, e guarda.
3. Em poucos minutos o site fica disponível em `teunome.github.io/nome-do-repositorio`.

**Render:**
1. Cria um "Static Site" novo, liga ao teu repositório do GitHub.
2. Build command: (deixa vazio). Publish directory: `.` (a pasta raiz).
3. Publica.

Qualquer um destes dois funciona perfeitamente — são apenas ficheiros estáticos, e toda a parte "viva" (contas, produtos, encomendas) é tratada pelo Supabase.

---

## O que o cliente pode fazer
Ver a página inicial, ver e pesquisar produtos, filtrar por categoria, ver detalhes, adicionar ao carrinho, ajustar quantidades, criar conta, login/logout, finalizar compras, ver o perfil, ver as suas encomendas e o estado delas, editar os seus dados, e ver favoritos.

## O que o gestor pode fazer (em `/manager`)
Adicionar, editar, apagar e ativar/desativar produtos (nome, descrição, preço, preço promocional, categoria, stock, imagem); ver todas as encomendas e reservas com todos os detalhes; mudar o estado da encomenda (Pendente → Pago → Em preparação → Enviado → Entregue, ou Cancelado); ver a lista de clientes; adicionar perguntas extra ao checkout; e ver um resumo de vendas.

## Atualização — cardápio, som de madeira e papéis da equipa

Depois de correres `supabase-schema.sql` e `supabase-migration-2.sql` (passo 2), corre também, por esta ordem:

1. `supabase-migration-3-papeis-equipa.sql` — permite os papéis "Gestor" e "Funcionário" (o painel já tinha o ecrã para isto, só faltava a base de dados aceitar).
2. `supabase-migration-4-ordem-produtos.sql` — adiciona o campo "ordem", para o cardápio aparecer sempre na sequência certa (e não por data ou alfabeticamente).
3. `supabase-menu-update.sql` — substitui os produtos de exemplo pelo cardápio oficial completo, já com a ordem definida (só corre isto uma vez).

Sobre o som de madeira dos carrosséis: já funciona sem precisares de fazer nada — é gerado na hora pelo navegador (Web Audio API). Se mais tarde quiseres usar uma gravação real de dois blocos de madeira a chocar, basta colocares o ficheiro em `assets/sounds/wood-click.mp3`; o site passa a usar automaticamente esse ficheiro em vez do som gerado.

## Notas importantes

- **Imagens dos produtos:** por agora, colam-se como um link (URL) — por exemplo, carregando a imagem para um serviço como o [imgur.com](https://imgur.com) e colando o link gerado. Se quiseres upload direto de ficheiros no painel, isso usa o "Supabase Storage" — é um passo extra que posso ajudar a configurar depois.
- **E-mails automáticos:** esta versão ainda não tem o envio automático de e-mails que tínhamos configurado antes (EmailJS). Como agora há uma base de dados a sério, o caminho profissional é usar uma "Supabase Edge Function" que dispara o e-mail sempre que uma encomenda é criada — posso construir isso a seguir, se quiseres.
- **Login com Google:** a estrutura já está pronta para isto (é só ativar o "Google" em Authentication → Providers no Supabase) — falamos disso quando quiseres avançar.
