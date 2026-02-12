## Customer Account (Crud)

### Descrição:

Processo de gerar movimentações, (Debitar/Creditar) saldo na conta do cliente.

### Rotas:

* CustomerDetail
* CustomerAccountEdit
* CustomerAccountBalance
* CustomerAccountFilter

### Serviços:

- KyteCustomerAccountStatements
- KyteCustomerAccountEdit

### Arquivos:

### ```CustomerAccount.js CustomerAccountEdit.js CustomerAccountBalance.js StatementItem.js models/customer.js CustomerActions.js CustomersReducer.js Calculator.js```


<hr />
#### CustomerAccount.js

> **path:** src/components/customers/customer/CustomerAccount.js
>
> **route:** *CustomerStack > CustomerDetail > CustomerAccount (tab)*

**Descrição:** Tab (conta): mostra o saldo do cliente e as movimenções geradas para ele.

**Métodos:**

> **componentWillMount:** *Na inicialização do Component é feito o fetch das movimentações do cliente ```action: customerAccountGetStatements```, no término do fetch o estado de loading ```statementsLoading``` é setado para ```false```*

```react
componentWillMount() {
  const { customer } = this.props;

  this.props.customerAccountGetStatements(customer.id);
}
```
**Props**:

| Propriedade                      | Descrição                                                    | Origem                                                       |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```customer.statementsLoading``` | *Estado de loading das movimentações, (começa como ```true``` para não segurar o acesso a página do cliente até o término do fetch* ```bool: true``` | ```CustomerReducer.js```                                     |
| ```customer.accountStatements``` | *Lista de movimentações do cliente* ```array: []```          | ```Action: customerAccountGetStatements > CustomerReducer.js``` |
| ```customer.accountBalance```    | *Saldo atual da conta do cliente* ```number: 0```            | ```Realm: models/customer.js > CustomerReducer.js```         |

**Actions**:

| Action                                                       | Descrição                                                    | Params              |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------- |
| ```customerAccountGetStatements type: CUSTOMER_ACCOUNT_GET_STATEMENTS``` | *Fetch das  movimentações das conta do cliente, ```service: KyteCustomerAccountStatements```* | ```(customer.id)``` |

<hr />
#### CustomerAccountEdit.js

> **path:** src/components/customers/customer/CustomerAccountEdit.js
>
> **route:** *CustomerStack > CustomerAccountEdit*

**Descrição:** Página Calculadora para edição do saldo da conta.

**Métodos:**

> **manageAccountBalance(number):**  *Controla os valores no reducer: ``customer.manageCustomerAccount``*

```react
manageAccountBalance(number) {
  const { isPositive } = this.state;

  this.props.customerManageNewBalance(isPositive ? 'add' : 'remove', Number(number));
}
```

**Props**:

| Propriedade                                    | Descrição                                                    | Origem                                               |
| ---------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| ```manageCustomerAccount.actualBalance```      | *Saldo atual do cliente, o valor no reducer é populado pela propriedade: ```customer.accountBalance```* | ```Realm: models/customer.js > CustomerReducer.js``` |
| ```manageCustomerAccount.transactionBalance``` | *Valor sendo adicionado através da calculadora*              | ```CustomerReducer.js```                             |
| ```manageCustomerAccount.newBalance```         | *Novo saldo da conta calculádo através do reducer*           | ```CustomerReducer.js```                             |

**Actions**:

| Action                                                       | Descrição                                                    | Params                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------- |
| ```customerManageNewBalance type: CUSTOMER_MANAGE_NEW_BALANCE``` | *Calcula o novo saldo a ser adicionado na conta: ```manageCustomerAccount.newBalance```* | ```(string: 'add' or 'remove', number)``` |

<hr />
#### CustomerAccountBalance.js

> **path:** src/components/customers/customer/CustomerAccountBalance.js
>
> **route:** *CustomerStack > CustomerAccountBalance*

**Descrição:** Página com o balanço entre o saldo atual e o novo saldo a ser (debitado/creditado) do cliente.

**Métodos:**

> **setNewBalance(transaction, successCb, errorCb):** *Gera uma nova movimentação de (débito/crédito) na conta do cliente através da action: ```customerAccountEditBalance```*

```javascript
const trasaction = {
  aid: auth.aid,
  uid: auth.user.uid,
  userName: auth.user.displayName,
  value: Math.abs(transactionBalance),
  type: transactionBalance > 0 ? 'IN' : 'OUT',
  customerId: customer.id
};
// IN movimentação de crédito
// OUT movimentação de débito

this.props.customerAccountEditBalance(
  trasaction,
  () => this.editBalance(),
  () => this.errorAlert()
);
```

**Props**:

| Propriedade                                    | Descrição                                                    | Origem                   |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------ |
| ```manageCustomerAccount.transactionBalance``` | *Valor utilizado pra gerar a nova movimentação*              | ```CustomerReducer.js``` |
| ```auth```                                     | *Extração do ```auth.aid, auth.user.uid e auth.user.displayName```* | ```AuthReducer.js```     |
| ```loader```                                   | *Estado de loading pós call do serviço*                      | ```CommonReducer.js```   |

**Actions**:

| Action                                                       | Descrição                                                    | Params                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------- |
| ```customerAccountEditBalance type: CUSTOMER_ACCOUNT_EDIT_BALANCE``` | *Gera uma nova movimentação na conta: ```service: KyteCustomerAccountEdit``` retorna o usuário com ```accountBalance``` atualizado e faz fetch das suas transações: ```service: KyteCustomerAccountStatements```  populando o ```accountStatements```* | ```(newBalance, successCb, errorCb)``` |
