# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/088328ab-231a-4576-9b17-eb1741ea249d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/088328ab-231a-4576-9b17-eb1741ea249d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/088328ab-231a-4576-9b17-eb1741ea249d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Sistema de Código Promocional

O sistema de código promocional foi implementado para permitir que novos usuários tenham acesso ao plano "Teste Gratuito" por 5 dias utilizando o código `ofertamdf`.

### Componentes Principais:

1. **SignupForm.tsx**: Formulário de cadastro que inclui campo para código promocional e exibição de planos disponíveis. Quando o código promocional é aplicado com sucesso, o plano gratuito é automaticamente selecionado.

2. **PromoCodeInput.tsx**: Componente reutilizável para entrada e validação do código promocional.

3. **PaymentRegistrationForm.tsx**: Formulário administrativo para registrar pagamentos, incluindo suporte a códigos promocionais.

4. **usePayments.ts**: Hook que gerencia a lógica de pagamentos, incluindo processamento de códigos promocionais.

### Banco de Dados:

As tabelas `pagamentos` e `temp_pagamentos` foram modificadas para incluir:
- Campo `promo_code`: Armazena o código promocional aplicado
- Campo `is_promo_applied`: Indica se um código promocional foi aplicado
- Campo `data_expiracao`: Data de expiração do plano (especialmente relevante para planos promocionais)

### Funcionalidades:

- Validação do código promocional "ofertamdf"
- Exibição de mensagem confirmando a validade do código
- Seleção automática do plano "Teste Gratuito" (5 dias)
- Atualização visual do botão "Aplicar" para "Aplicado" quando o código é válido
- Integração com o sistema de pagamentos existente

### Fluxo de Usuário:

1. Usuário acessa a página de cadastro
2. Preenche o formulário e opcionalmente insere o código promocional
3. Se o código for válido, o sistema libera o plano gratuito e exibe mensagem de confirmação
4. Usuário conclui o cadastro com o plano de teste gratuito por 5 dias

Esta implementação simplifica o processo de cadastro e oferece uma abordagem clara para os usuários experimentarem o sistema antes de escolher um plano pago.
