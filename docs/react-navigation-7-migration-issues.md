# React Navigation 7.x Migration - Known Issues

## Context

- **React Native upgrade:** 0.67.5 → 0.81.5
- **React Navigation upgrade:** 6.x → 7.x
- **Date identified:** 2026-02-04
- **Affected version:** APP 3.0.0+

## What Changed in React Navigation 7.x

### Breaking Change: Navigation Resolution Algorithm

| Behavior | v6 (Old) | v7 (New) |
|----------|----------|----------|
| `navigate('ScreenName')` | Searches UP and DOWN the navigator tree | **Only searches UP** (parent navigators) |
| Cross-navigator navigation | Automatically found screens in child navigators | Must explicitly target or use stack-local screens |
| `NavigationService.navigate(null, 'Screen')` | Dispatches from root navigator | Still works - dispatches `CommonActions.navigate()` from root |
| `useNavigation()` in nested navigators | Returns inner stack's navigation | May return parent Drawer's navigation |

## Navigation Patterns Analysis

### ❌ BROKEN Pattern (Implicit Screen Search from Nested Stack)

```javascript
// FROM: Inside a nested stack (e.g., UsersStack)
// TO: Screen in a DIFFERENT stack or drawer-level

// BROKEN in v7:
navigation.navigate('PageConfirmation', { onPress: 'Users', ... })

// WHY IT BREAKS:
// 1. v7 only searches UP to parent navigators, not DOWN/SIDEWAYS to siblings
// 2. From UsersStack, it can't find PageConfirmation (which is in drawer or ConfirmationStack)
// 3. PageConfirmation.componentWillUnmount calls reset() which can conflict
```

### ✅ CORRECT Pattern (Explicit Nested Navigation)

```javascript
// Pattern 1: Explicit parent + nested screen (NavigationService)
NavigationService.navigate('Confirmation', 'SendCode', params)
// Translates to: CommonActions.navigate('Confirmation', { screen: 'SendCode', params })
// This WORKS in v7 - explicitly targets parent navigator

// Pattern 2: Stack-local navigation
navigation.navigate('UserConfirmation', {  // Screen within same stack
  returnPreviousScreen: true,
  labelButton: 'OK',
  textConfirmation: 'Success message',
})
```

## Affected Flows Checklist

### Confirmed BROKEN - Fixed

- [x] **UserAdd.js:65-76** - User creation confirmation
  - **Was:** `navigation.navigate('PageConfirmation', { onPress: 'Users' })`
  - **Fix:** `navigation.navigate('UserConfirmation', { returnPreviousScreen: true })`
  - **Status:** FIXED (2026-02-04)

- [x] **UserEdit.js:147-155** - User edit save confirmation
  - **Was:** `navigation.navigate('PageConfirmation', { onPress: 'Users' })`
  - **Fix:** `navigation.navigate('UserConfirmation', { returnPreviousScreen: true })`
  - **Status:** FIXED (2026-02-04)

- [x] **UserEdit.js:169-177** - User delete confirmation
  - **Was:** `navigation.navigate('PageConfirmation', { onPress: 'Users' })` + `pop(2)`
  - **Fix:** `navigation.navigate('UserConfirmation', { returnPreviousScreen: true })`
  - **Status:** FIXED (2026-02-04)

### Likely OK - Uses Correct Pattern (Verify Manually)

These use `NavigationService.navigate('Parent', 'Screen', params)` which is the correct v7 pattern:

- [ ] **ConfigContainer.js:81** - Store catalog code access
  - Pattern: `NavigationService.navigate('Confirmation', 'SendCode', { origin: 'user-blocked', previousScreen: 'CurrentSale' })`
  - Assessment: **Likely OK** - uses explicit nested navigation
  - Action: Verify manually

- [ ] **CartContainer.js:741** - User blocked during cart operations
  - Pattern: `NavigationService.navigate('Confirmation', 'SendCode', { ... })`
  - Assessment: **Likely OK**
  - Action: Verify manually

- [ ] **ProductSaleContainer.js:242, 352, 546** - User blocked during product sale
  - Pattern: `NavigationService.navigate('Confirmation', 'SendCode', { ... })`
  - Assessment: **Likely OK**
  - Action: Verify manually

- [ ] **QuickSaleContainer.js:50** - User blocked during quick sale
  - Pattern: `NavigationService.navigate('Confirmation', 'SendCode', { ... })`
  - Assessment: **Likely OK**
  - Action: Verify manually

- [ ] **CustomerNav.js:47** - User blocked in customers section
  - Pattern: `NavigationService.navigate('Confirmation', 'SendCode', { ... })`
  - Assessment: **Likely OK**
  - Action: Verify manually

- [ ] **Account.js:120** - Account confirmation flow
  - Pattern: `NavigationService.navigate('Confirmation', 'AccountConfirmation', { ... })`
  - Assessment: **Likely OK**
  - Action: Verify manually

### Needs Review - Potentially Problematic

- [ ] **NotificationActions.js:163** - Notification-triggered confirmation
  - Pattern: `NavigationService.navigate('Confirmation', 'PageConfirmation')`
  - Assessment: Uses explicit parent, but triggered from outside navigator context
  - Action: Test notification flows

- [ ] **DrawerContent.js:72** - Drawer menu navigation
  - Pattern: `NavigationService.navigate(null, 'Confirmation', { ... })`
  - Assessment: **Likely OK** - dispatches from root, Confirmation is drawer-level
  - Action: Verify manually

- [ ] **PageConfirmation.js:44, 61** - Navigation back after OK press
  - Pattern: `NavigationService.navigate(null, this.state.onPress)`
  - Assessment: **Likely OK** - dispatches from root navigator to drawer-level screens
  - Note: The issue was getting TO PageConfirmation, not navigating FROM it

## Root Cause Summary

The issue is specifically with **navigating from inside a nested stack to a screen in a different stack/navigator**.

**NOT broken:**
- `NavigationService.navigate('Parent', 'Screen')` - explicit nested navigation
- `NavigationService.navigate(null, 'Screen')` - dispatches from root, finds drawer-level screens

**BROKEN:**
- `navigation.navigate('ScreenName')` from inside a nested stack, where ScreenName is in a DIFFERENT stack
- In v7, this only searches UP (parents), not DOWN/SIDEWAYS (siblings/children)

## Stacks Structure Reference

### Stacks WITH Local Confirmation Screens

| Stack | Confirmation Screen | Defined In |
|-------|---------------------|------------|
| `UsersStack` | `UserConfirmation` | `src/screens/Users.js:30` |
| `AccountStack` | `UserConfirmation` | `src/screens/Account.js:19` |
| `UsersLockStack` | `UsersLockConfirmation` | `src/screens/UsersLock.js:22` |
| `ConfirmationStack` | `PageConfirmation`, `SendCode`, `AccountConfirmation` | `src/screens/Confirmation.js` |

## Recommended Fix for Future Issues

If you find a broken flow, the fix pattern is:

```javascript
// Instead of navigating to drawer-level PageConfirmation:
navigation.navigate('PageConfirmation', { onPress: 'TargetScreen', ... })

// Navigate to stack-local confirmation screen:
navigation.navigate('StackLocalConfirmation', {
  returnPreviousScreen: true,  // or returnToScreen: 'TargetScreen'
  ...
})
```

## Testing Checklist

After any navigation fix, verify:

- [ ] User can complete the flow end-to-end
- [ ] Confirmation screen displays correctly
- [ ] OK button returns to correct screen
- [ ] Back button/gesture behaves correctly
- [ ] Android hardware back button works
- [ ] No "stuck on screen" issues
- [ ] No navigation state corruption

## References

- [React Navigation 7.0 Release Notes](https://reactnavigation.org/blog/2024/11/06/react-navigation-7.0/)
- [Upgrading from 6.x Guide](https://reactnavigation.org/docs/upgrading-from-6.x/)
- [GitHub Issue: useNavigation differs in v7](https://github.com/react-navigation/react-navigation/issues/12354)
- [GitHub Issue: reset in nested navigator](https://github.com/react-navigation/react-navigation/issues/12259)

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-04 | Claude Code | Initial document, fixed UserAdd.js and UserEdit.js |
| 2026-02-04 | Claude Code | Corrected assessment - SendCode flows likely OK, clarified broken vs correct patterns |
