# Cad.Trat.Odont - Cadastro de Tratamentos Odontológicos

Projeto completo: **Frontend HTML/CSS/JS + Backend Node.js/Express**.

## Funcionalidade

-  Dentista cadastra descrição do atendimento
-  Envia para homologação (simulada)
-  Recebe resposta: aprovado ou recusado
-  Se recusado, edita descrição e reenvia
-  Visualiza histórico de tratamentos

## Requisitos

- **Node.js 14+** (com npm)

## Como executar

### 1. Instalar dependências

```powershell
cd "c:\Users\silas\OneDrive\Área de Trabalho\Cad.Trat.Odont"
npm install
```

### 2. Iniciar o servidor

```powershell
npm start
```

Ou modo desenvolvimento:

```powershell
npm run dev
```

### 3. Acessar a aplicação

Abra no navegador: **http://localhost:8080**

## Arquitetura

### Backend (Node.js/Express)
- `src/server.js` - Servidor Express com rotas REST
- `src/service.js` - Lógica de negócio
- `src/repository.js` - Armazenamento em memória
- `src/homologationMock.js` - Simulação da API de homologação
- `src/model.js` - Modelo de dados

### Frontend (HTML/CSS/JS)
- `public/index.html` - Interface do usuário
- `public/style.css` - Estilos responsivos
- `public/app.js` - Lógica do cliente e requisições AJAX

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/treatments` | Criar novo tratamento |
| GET | `/api/treatments` | Listar todos os tratamentos |
| GET | `/api/treatments/:id` | Obter tratamento específico |
| POST | `/api/treatments/:id/send-homologation` | Enviar para homologação |
| PUT | `/api/treatments/:id` | Atualizar tratamento |
| DELETE | `/api/treatments/:id` | Deletar tratamento |

## Fluxo de uso

1. **Criar**: Preencha a descrição do procedimento e clique "Criar Cadastro"
2. **Enviar**: Clique "Enviar para Homologação"
3. **Aguardar**: Sistema simula resposta da homologação
4. **Resultado**:
   -  **Aprovado**: Status registrado como aprovado
   -  **Recusado**: Pode editar e reenviar

## Observações

- A homologação é **simulada internamente** (mock) com taxa de aprovação de 70%
- Os dados são armazenados **em memória** (não persistem após reiniciar)
- Pode ser facilmente integrada com um serviço externo de homologação
- Responsivo e funciona em mobile
