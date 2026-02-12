## KyteText

### Descrição:

Common para texto com a font e cor padrão do Kyte.

```javascript
import { KyteText } from './common';
```

```jsx
<KyteText weight="Semibold" size="14" pallete="actionColor" style={style}>
  {content}
</KyteText>
```

**Props**:

| Propriedade         | Descrição                                                    | Default            |
| ------------------- | ------------------------------------------------------------ | ------------------ |
| ```weight```        | *fontWeight* ```string: 'Regular', 'Medium', Semibold', 'Bold', 'Light', 'Extralight', 'Thin'``` | ```'Regular'```    |
| ``size``            | *fontSize* ```number ```                                     | 12                 |
| ```pallete```       | *Cores provenientes da paleta, styles/colors.js*  ```string: 'actionColor', 'primaryColor', 'secondaryColor','errorColor'``` *etc.* | ```primaryColor``` |
| ```color```         | *Hexadecimal*  ```string```                                  | ```#4d5461```      |
| ```uppercase```     | ```bool```                                                   | ```false```        |
| ```style```         | *Style Object* ```object```                                  | ```null```         |
| ```ellipsizeMode``` | *Mesmo do <Text> do native* ```string```                     | ```null```         |
| ```numerOfLines```  | *Mesmo do <Text> do native* ```string```                     | ```null```         |
| ```onPress```       | *Mesmo do <Text> do native* ```function```                   | ```null```         |
