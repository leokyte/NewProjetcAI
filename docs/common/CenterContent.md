## FilterLabel

### Descrição:

Common para o label dos filtros do SalesHistoryContainer e CustomerContainer.

```javascript
import { FilterLabel } from './common';
```

```jsx
<FilterLabel onPress={() => null} key={i} active={false}>
  {content}
</FilterLabel>
```

**Props**:

| Propriedade   | Descrição                                                    | Default     |
| ------------- | ------------------------------------------------------------ | ----------- |
| ```onPress``` | *Método* ```function```                                      | ```null```  |
| ``key``       | *key* ```number ```                                          | ```null```  |
| ```active```  | *Quando true iverte as cores do label (estado ativo)*  ```bool``` | ```false``` |
