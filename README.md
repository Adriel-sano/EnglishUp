

## Site + App sincronizados
O projeto agora usa a mesma aplicação web como:
- site responsivo em qualquer navegador;
- PWA instalável como aplicativo.

Ao criar uma conta, o progresso é salvo no servidor em `data/users.json` e pode ser carregado em outro dispositivo com o mesmo login. Para produção, troque esse armazenamento por PostgreSQL/Supabase/Firebase ou outro banco gerenciado.

### Publicação
Publique esta pasta em um servidor Node.js. O endereço público será o site. No celular, use "Adicionar à tela inicial" para instalar o mesmo produto como app. Ambos acessam o mesmo domínio/API e, portanto, a mesma conta.
