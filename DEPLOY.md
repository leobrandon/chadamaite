# 🌸 Guia de Publicação Gratuita (Deploy) - Chá da Maitê

Este projeto foi construído para ser hospedado **100% gratuitamente** com máxima facilidade e rapidez. Abaixo estão as duas formas mais fáceis e recomendadas:

---

## ⚡ Opção 1: Vercel (Recomendado - 2 minutos)

A Vercel é a plataforma mais moderna e rápida para hospedar aplicações React/Vite.

### Método A: Direto pelo Navegador (Sem instalar nada no terminal)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Se você usa GitHub, suba a pasta do projeto para um repositório no seu GitHub.
3. No painel da Vercel, clique em **"Add New..."** ➔ **"Project"** ➔ Importe o repositório do seu GitHub.
4. A Vercel detectará automaticamente o Vite. Clique em **"Deploy"**.
5. Em menos de 1 minuto seu site estará online com um link tipo: `https://cha-da-maite.vercel.app`! 🎉

### Método B: Pelo Terminal (Vercel CLI)
Abra o terminal na pasta deste projeto e execute:
```bash
npx vercel
```
- Siga as instruções rápidas na tela (basta apertar Enter para confirmar as opções padrão).
- Seu site será publicado imediatamente!

---

## 🍃 Opção 2: Netlify (Arrastar e Soltar - 1 minuto)

O Netlify permite publicar o site apenas arrastando a pasta do projeto construída.

1. No terminal do seu computador, execute o comando de compilação:
   ```bash
   npm run build
   ```
   *(Isso criará uma pasta chamada `dist` com todos os arquivos otimizados prontos para a web).*
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) (crie sua conta gratuita).
3. **Arraste e solte** a pasta `dist` (que está dentro de `c:\Projetos Antigravity\Projeto Chá Maitê\dist`) diretamente na tela do Netlify.
4. Pronto! O site será publicado instantaneamente e você receberá o link para compartilhar no WhatsApp dos convidados!

---

## 🐙 Opção 3: GitHub Pages

1. Crie um repositório no GitHub chamado `cha-da-maite`.
2. No arquivo `vite.config.js`, defina `base: '/cha-da-maite/'`.
3. Suba o código para o GitHub e ative o **GitHub Pages** nas configurações do repositório (*Settings > Pages > Source: GitHub Actions*).

---

## 📱 Dica para Enviar no WhatsApp aos Convidados:

> *"Olá família e amigos! 🌸 É com muita alegria que convidamos vocês para o Chá de Bebê da nossa princesinha Maitê!*  
> *Para ver a lista de presentes e confirmar sua presença, acesse nosso site especial:*  
> *👉 [SEU_LINK_AQUI]*  
> *Esperamos vocês com muito amor! — Leonardo & Isabella 💖"*
