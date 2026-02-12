## KyteAccountInitializer

> **path:**  src/services/kyte-account.js
>
> **API:**  *kyte-user-account.azurewebsites.net/api/**account-info/{aid}***

**Descrição:** Este serviço é responsável por trazer as informações de billing, taxas e preferências da conta (account).

**Método:**

```javascript
// APP Initializer
export const KyteAccountInitializer = (aid) => axiosAccountAPI.get(`/account-info/${aid}`);
```

**Response**:

| Propriedade         | Valores                                                      |
| :------------------ | :----------------------------------------------------------- |
| ```billing```       | ```{ aid, country, creationDate, creationDateLocal, displayName, email, endDate, os, plan, provider, status, toleranceEndDate, uid, planInfo }``` |
| ```taxes```         | ```[{ active, _id, name, percent, userName, aid, uid, optional, type, typePercentFixed, dateCreation }]``` |
| ``` preferences ``` | ```{ _id, countryCode, currency, showCanceledSales, decimalCurrency } ``` |

**Uso:**

> *O KyteAccountInitializer é utilizado na inicilização do app para conferir os dados do billing e preferências que possam ter sido alteradas por outras contas.*

###### AppContainer.js

```javascript
function initializeActions() {
  this.props.authInitialize();
}
```

###### _InitializeActions.js

```javascript
export const AccountInitializer = () => {
  KyteAccountInitializer(aid).then((response) => {
    const { billing, taxes, preferences } = response.data;
	}
}
```
