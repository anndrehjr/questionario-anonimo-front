# Voto — questionários anônimos

SPA React 18 + Vite + TypeScript para criar e responder questionários anônimos em sala de aula. O frontend consome uma API REST separada; o backend é responsável pela autorização, validação de respostas e controle de participação. A proteção no navegador reduz reenvios acidentais, mas não substitui validação do servidor.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Defina `VITE_API_URL` se a API não estiver no mesmo domínio. O Vite encaminha `/api` para `http://127.0.0.1:3000` durante o desenvolvimento. Para explorar sem backend, defina `VITE_USE_MOCK=true`. Login de demonstração: `professor` / `sala123`.

## Comandos

- `npm run dev` — servidor de desenvolvimento.
- `npm test` — testes unitários Vitest.
- `npm run build` — checagem TypeScript e bundle estático em `dist/`.
- `npm run preview` — serve localmente o bundle gerado.

## Variáveis

Veja `.env.example`. `VITE_API_URL` é opcional quando a API está sob `/api` no mesmo domínio. Variáveis `VITE_*` são públicas e nunca devem conter segredos.

## API e sessão

O cliente Axios inclui cookies (`withCredentials`). Configure a sessão no servidor como cookie `HttpOnly`, `Secure` em produção e `SameSite=Strict`; proteja também mutações contra CSRF e valide cada resposta no backend. Para implantação no mesmo domínio, o bloco `deploy/nginx.conf` inclui proxy de `/api/` e fallback SPA. Revise CSP/origens quando adicionar novos endpoints ou ativos. Os logs de acesso de `/q/` e `/api/public/` estão desabilitados nesse exemplo para minimizar dados de acesso, mas logs de proxy, CDN e infraestrutura também devem ser revisados.

## Anonimato

A interface pública não solicita dados pessoais e não carrega analytics ou pixels. O envio inclui apenas as respostas selecionadas e o ID do quiz no corpo conforme o contrato da API. `localStorage` guarda somente a marca de resposta já enviada para evitar reenvios acidentais no mesmo navegador; esse marcador não é enviado à API. Isso não é mecanismo de segurança: deduplicação e anonimato precisam ser garantidos pelo backend.

## Publicação

Sirva o conteúdo de `dist/` via Nginx ou outro servidor estático com fallback para `index.html`. O arquivo `deploy/nginx.conf` é um exemplo: ajuste domínio, caminho e política CSP ao ambiente. A API deve aceitar requisições no mesmo domínio por `/api/` para cookies first-party.
