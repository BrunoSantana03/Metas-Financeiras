# Metas Financeiras

Aplicativo React Native com Expo para cadastrar metas financeiras, registrar entradas e saidas, acompanhar o progresso de cada objetivo e manter os dados salvos localmente com SQLite.

## Funcionalidades

- Criar, editar e remover metas financeiras.
- Registrar transacoes de entrada e saida para cada meta.
- Calcular saldo acumulado, entradas, saidas e percentual de progresso.
- Listar o historico de transacoes por meta.
- Persistir os dados offline no dispositivo usando `expo-sqlite`.
- Remover automaticamente as transacoes de uma meta excluida com `ON DELETE CASCADE`.

## Rodar localmente

Instale as dependencias:

```bash
npm install
```

Inicie o Expo:

```bash
npm run start
```

Outros comandos disponiveis:

```bash
npm run android
npm run ios
npm run web
npm run export:android
```

## Estrutura do projeto

```txt
App.js
index.js
app.json
package.json
src/
  database/
    migrate.js
    useTargetDatabase.js
    useTransactionsDatabase.js
```

## Observacao

Este projeto usa `expo-sqlite ~16.0.10`, versao instalada pelo `npx expo install` para manter compatibilidade com o Expo SDK 54.
