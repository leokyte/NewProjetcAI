# Estrutura Inicial de Screen no Projeto Kyte

## Visão Geral

Este documento descreve o padrão para criar uma nova screen (tela) no projeto Kyte, seguindo as convenções estabelecidas e melhores práticas observadas no codebase.

## 🏗️ Componente Base - KyteScreen

O projeto inclui um componente base `KyteScreen` que encapsula toda a estrutura padrão:

## Estrutura de Arquivos

Uma screen típica no projeto Kyte segue esta estrutura:

```
src/
├── screens/
│   └── MinhaTela.ts                    # Stack Navigator
└── components/
    └── minha-tela/
        ├── MinhaTela.tsx               # Componente principal
        ├── MinhaTelaUI.tsx             # Componente de UI (quando necessário)
        └── components/                 # Subcomponentes específicos
            └── MinhaTelaNav.tsx        # Navegação/Header (quando necessário)
```

## 1. Criando o Stack Navigator

O Stack Navigator deve ser criado em `src/screens/` e segue este padrão:

```typescript
// src/screens/MinhaTelaStack.ts
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import MinhaTela from '../components/MinhaTela'

const Stack = createStackNavigator()

const MinhaTelaStack = () => (
	<Stack.Navigator>
		<Stack.Screen
			name="MinhaTelaMain"
			component={MinhaTela}
			options={{
				title: 'Minha Tela',
				headerShown: false,
			}}
		/>
	</Stack.Navigator>
)

export default MinhaTelaStack
```

## 2. Criando o Componente Principal - Versão Simples

Usando o componente `KyteScreen`, a criação fica muito mais simples:

```typescript
// src/components/MinhaTela.tsx
import React from 'react'
import { Container, KyteText } from '@kyteapp/kyte-ui-components'
import { colors } from '../styles'
import { KyteScreen } from './common'

const MinhaTela = ({ navigation }: any) => {
	return (
		<KyteScreen
			navigation={navigation}
			title="Minha Tela"
		>
			<Container flex={1} justifyContent="center" alignItems="center">
				<KyteText
					size={16}
					color={colors.secondaryColor}
					style={{ textAlign: 'center' }}
				>
					Conteúdo da minha tela
				</KyteText>
			</Container>
		</KyteScreen>
	)
}

export default MinhaTela
```

### Propriedades do KyteScreen

| Propriedade | Tipo | Obrigatório | Padrão | Descrição |
|-------------|------|-------------|---------|-----------|
| `children` | `React.ReactNode` | ✅ | - | Conteúdo da tela |
| `navigation` | `any` | ✅ | - | Objeto de navegação |
| `title` | `string` | ✅ | - | Título da tela |
| `maxHeight` | `number` | ❌ | `620` | Altura máxima do container |
| `backgroundColor` | `string` | ❌ | `colors.lightBg` | Cor de fundo |
| `rightButtons` | `any[]` | ❌ | - | Botões do header |
| `hideHeader` | `boolean` | ❌ | `false` | Ocultar header |
| `headerProps` | `any` | ❌ | `{}` | Props do KyteToolbar |
| `containerProps` | `any` | ❌ | `{}` | Props do Container principal |
| `contentContainerProps` | `any` | ❌ | `{}` | Props do Container do conteúdo |

### Exemplo com Botões no Header

```typescript
const MinhaTela = ({ navigation }: any) => {
	const rightButtons = [
		{
			icon: 'export',
			onPress: () => navigation.navigate('DataExport'),
			color: colors.primaryColor,
		},
		{
			icon: 'plus-calculator',
			color: colors.actionColor,
			onPress: () => navigation.navigate('MinhaTelaCreate'),
			iconSize: 18,
		},
	]

	return (
		<KyteScreen
			navigation={navigation}
			title="Minha Tela"
			rightButtons={rightButtons}
		>
			{/* Seu conteúdo aqui */}
		</KyteScreen>
	)
}
```

## 3. Estrutura Avançada com Navegação Personalizada

Para screens que precisam de navegação mais complexa (como botões no header), crie um componente separado:

```typescript
// src/components/minha-tela/MinhaTelaNav.tsx
import React from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import { KyteToolbar, KyteSafeAreaView } from '../common'
import { colors } from '../../styles'
import I18n from '../../i18n/i18n'

const MinhaTelaNav = ({ navigation, user, minhaListaSize }: any) => {
	const containerBackground = {
		...Platform.select({
			ios: { backgroundColor: '#FFFFFF' },
			android: { backgroundColor: 'transparent' },
		}),
	}

	const rightButtons = [
		{
			icon: 'export',
			onPress: () => navigation.navigate('DataExport', { selected: { minhaTela: true } }),
			color: colors.primaryColor,
			isHidden: false, // Lógica de permissão aqui
		},
		{
			icon: 'plus-calculator',
			color: colors.actionColor,
			onPress: () => handleCreateAction(),
			iconSize: 18,
		},
	]

	const handleCreateAction = () => {
		// Lógica para criar novo item
		navigation.navigate('MinhaTelaCreate')
	}

	return (
		<KyteSafeAreaView style={containerBackground}>
			<KyteToolbar
				borderBottom={0}
				headerTitle={`${I18n.t('sideMenu.minhaTela')} (${minhaListaSize})`}
				rightButtons={rightButtons}
				navigation={navigation}
				{...{} as any}
			/>
		</KyteSafeAreaView>
	)
}

const mapStateToProps = (state: any) => ({
	user: state.auth.user,
	minhaListaSize: state.minhaTela.list.length,
})

export default connect(mapStateToProps, {})(MinhaTelaNav)
```

## 4. Estrutura com Container e UI Separados

Para screens complexas com lógica de negócio, separe em Container e UI:

```typescript
// src/components/minha-tela/MinhaTela.tsx (Container)
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'
import MinhaTelaUI from './MinhaTelaUI'
import { fetchMinhaTelaData } from '../../stores/actions/MinhaTelaActions'

const MinhaTela = ({ navigation, minhaTelaData, isLoading, fetchData }: any) => {
	const [shouldRefresh, setShouldRefresh] = useState(false)

	useFocusEffect(
		React.useCallback(() => {
			setShouldRefresh(true)
			setTimeout(() => setShouldRefresh(false), 100)
		}, [])
	)

	useEffect(() => {
		fetchData()
	}, [])

	const handleItemPress = (item: any) => {
		navigation.navigate('MinhaTelaDetail', { item })
	}

	const handleCreateNew = () => {
		navigation.navigate('MinhaTelaCreate')
	}

	return (
		<MinhaTelaUI
			navigation={navigation}
			data={minhaTelaData}
			isLoading={isLoading || shouldRefresh}
			onItemPress={handleItemPress}
			onCreateNew={handleCreateNew}
		/>
	)
}

const mapStateToProps = (state: any) => ({
	minhaTelaData: state.minhaTela.list,
	isLoading: state.minhaTela.isLoading,
})

export default connect(mapStateToProps, { fetchData: fetchMinhaTelaData })(MinhaTela)
```

```typescript
// src/components/minha-tela/MinhaTelaUI.tsx (UI)
import React from 'react'
import { Container, KyteText } from '@kyteapp/kyte-ui-components'
import { colors } from '../../styles'
import { TabletScreenContainer } from '../common/scaffolding/TabletScreenContainer'
import MinhaTelaNav from './MinhaTelaNav'

interface MinhaTelaUIProps {
	navigation: any
	data: any[]
	isLoading: boolean
	onItemPress: (item: any) => void
	onCreateNew: () => void
}

const MinhaTelaUI: React.FC<MinhaTelaUIProps> = ({
	navigation,
	data,
	isLoading,
	onItemPress,
	onCreateNew,
}) => {
	const renderContent = () => (
		<Container flex={1} backgroundColor={colors.lightBg}>
			{/* Lista ou conteúdo principal */}
			<Container flex={1} paddingHorizontal={20} paddingVertical={20}>
				{data.map((item, index) => (
					<Container key={index} marginBottom={10}>
						<KyteText onPress={() => onItemPress(item)}>
							{item.name}
						</KyteText>
					</Container>
				))}
			</Container>
		</Container>
	)

	return (
		<TabletScreenContainer maxHeight={620}>
			<Container flex={1}>
				<MinhaTelaNav navigation={navigation} />
				{renderContent()}
			</Container>
		</TabletScreenContainer>
	)
}

export default MinhaTelaUI
```

## 5. Exportando a Screen

Adicione a exportação no arquivo `src/screens/index.js`:

```javascript
// src/screens/index.js
export { default as MinhaTelaStack } from './MinhaTelaStack'
```

## 6. Adicionando ao Router

Adicione a nova rota no `src/Router.js`:

```javascript
// src/Router.js
<Drawer.Screen
	name="MinhaTela"
	component={Screens.MinhaTelaStack}
	options={{
		unmountOnBlur: false,
		drawerLabel: 'Minha Tela',
		drawerIcon: (isOpen) => <DrawerIcon isOpen={isOpen} name="meu-icone" />,
	}}
/>
```

## Componentes Essenciais

### Componentes de Layout
- `TabletScreenContainer`: Container responsivo para tablets/desktop
- `KyteSafeAreaView`: Safe area para iOS
- `Container`: Container flexível do design system

### Componentes de Navegação
- `KyteToolbar`: Barra de ferramentas padrão com menu hamburger
- `DrawerIcon`: Ícone para o menu lateral

### Componentes de UI
- `KyteText`: Componente de texto padrão
- `KyteButton`: Botão padrão
- `HeaderButton`: Botão para header/toolbar

## Padrões de Estilo

### Cores Comuns
- `colors.lightBg`: Fundo claro padrão
- `colors.white`: Branco
- `colors.primaryColor`: Cor primária
- `colors.secondaryColor`: Cor secundária
- `colors.actionColor`: Cor de ação (botões)

### Espaçamento Padrão
- `paddingHorizontal={20}`: Padding horizontal padrão
- `paddingVertical={20}`: Padding vertical padrão
- `marginBottom={10}`: Margem bottom comum

## Boas Práticas

1. **Sempre use `TabletScreenContainer`** para responsividade
2. **Separe lógica de negócio da UI** em screens complexas
3. **Use `connect` do Redux** quando precisar de dados do store
4. **Implemente `useFocusEffect`** para refresh ao navegar de volta
5. **Crie componentes de navegação separados** quando há botões no header
6. **Use TypeScript** para type safety
7. **Siga as convenções de nomenclatura** do projeto
8. **Teste em mobile e tablet** durante o desenvolvimento

## Exemplo Completo

Para um exemplo completo, consulte:
- `src/components/SmartAssistant.tsx` (estrutura simples)
- `src/components/dashboard/Dashboard.js` e `DashboardUI.js` (estrutura complexa)
- `src/components/customers/CustomerContainer.js` (com navegação personalizada)
