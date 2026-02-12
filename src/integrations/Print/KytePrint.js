import { EscPos } from '@datahex/escpos-xml'
import { Buffer } from 'buffer'
import { BleManager } from 'react-native-ble-plx'
import RNBluetoothClassic from 'react-native-bluetooth-classic'

import I18n from '../../i18n/i18n'
import { isFixedTax, removeAccents } from '../../util'

const manager = new BleManager()
const BLE_CHUNK_SIZE = 20
const CLASSIC_CHUNK_SIZE = 256

class KytePrint {
	constructor(paperType = '80mm', printerId, printerType, printerName) {
		this.printer = new EscPos('KytePrinter')
		this.printerName = printerName
		this.printerConfig = {
			paperType,
			printerId,
			printerType,
		}
		this._xmlBuilt = null
	}

	get xmlBuilt() {
		return this._xmlBuilt
	}

	set xmlBuilt(xmlBuilt) {
		this._xmlBuilt = xmlBuilt
		return this
	}

	generateWhiteSpaces(emptySize, fillSize, spaceString = ' ') {
		let whiteSpaces = ''
		if (emptySize - fillSize <= 0) {
			for (let i = 0; i < 5; i++) {
				whiteSpaces += spaceString
			}
			return whiteSpaces
		}

		for (let i = 0; i < emptySize - fillSize; i++) {
			whiteSpaces += spaceString
		}
		return whiteSpaces
	}

	generateItemWhiteSpaces(item, salePrice) {
		const emptySize = this.printerConfig.paperType === '58mm' ? 32 : 48
		if (item.length <= emptySize - 2) {
			return this.generateWhiteSpaces(emptySize, item.length + salePrice.toString().length, '.')
		}

		const substringValue =
			this.printerConfig.paperType === '58mm' ? item.length - emptySize - emptySize : item.length - emptySize
		return this.generateWhiteSpaces(
			emptySize,
			item.substr(substringValue * -1).length + salePrice.toString().length,
			'.'
		)
	}

	generateLineSeparator(symbol = '_') {
		const lineSize = this.printerConfig.paperType === '80mm' ? 48 : 32
		let lineSeparator = ''
		for (let i = 0; i < lineSize; i++) {
			lineSeparator += symbol
		}
		return lineSeparator
	}

	generateStoreHeader(store, label) {
		const { storeName, storePhone, receiptText, receiptNumber } = store

		const spaceDiff = receiptText ? 10 : 5
		const diff = `${receiptText} ${receiptNumber}`.length - spaceDiff
		let storePhoneWhiteSpaces = this.generateWhiteSpaces(
			55 - diff,
			storePhone.length + receiptText.length + receiptNumber.length
		)
		if (this.printerConfig.paperType === '58mm') {
			storePhoneWhiteSpaces = this.generateWhiteSpaces(
				34 - diff,
				storePhone.length + receiptText.length + receiptNumber.length
			)
		}

		let xmlStoreHeader = `
      <line-feed />
      <text size="0:1">${storeName}</text>
      <line-feed />
      <small>
        <text>${storePhone ? storePhone + storePhoneWhiteSpaces : ''}</text>
      </small>
      <small>
        <text size="0:0">${receiptText}</text>
      </small>
      <text size="1:0">${receiptNumber}</text>

      <line-feed />
    `

		if (label) {
			xmlStoreHeader += `
        <small>
          <text-line size="0:0">${removeAccents(label)}</text-line>
        </small>
      `
		}

		return xmlStoreHeader
	}

	generateCustomerStatementsHeader(store, customer) {
		const { storeName, storeHeader, storePhone, dateCreation } = store
		const { name: customerName } = customer
		const realStoreName = storeName || ''

		let storeHeaderWhiteSpaces = this.generateWhiteSpaces(
			55 - realStoreName.length,
			realStoreName.length + dateCreation.length
		)
		if (this.printerConfig.paperType === '58mm') {
			storeHeaderWhiteSpaces = this.generateWhiteSpaces(
				40 - realStoreName.length,
				realStoreName.length + dateCreation.length
			)
		}

		const xmlStoreHeader = `
      <line-feed />
      <text size="0:1">${storeName}${storeHeaderWhiteSpaces}</text>
      <line-feed />
      <small><text>${dateCreation}</text></small>
      <line-feed />
      <text>${storePhone || ''}</text>
      <line-feed />
      <text>${storeHeader || ''}</text>
      <line-feed />
      <line-feed />
      <bold>
        <small><text>${removeAccents(customerName)}</text></small>
      </bold>
      <line-feed />
    `
		return xmlStoreHeader
	}

	generateCustomerStatements(customer) {
		let accountBalanceWhiteSpaces = this.generateWhiteSpaces(
			44 - `${I18n.t('customerAccount.currentBalance')} ${customer.accountBalance}`.length,
			I18n.t('customerAccount.currentBalance').length + customer.accountBalance.length
		)
		let statementsHeaderWhiteSpaces = this.generateWhiteSpaces(
			48,
			I18n.t('words.s.activity').length + I18n.t('words.s.balance').length
		)
		let accountBalanceSize = '1:1'
		if (this.printerConfig.paperType === '58mm') {
			accountBalanceWhiteSpaces = this.generateWhiteSpaces(
				31,
				I18n.t('customerAccount.currentBalance').length + customer.accountBalance.length
			)
			statementsHeaderWhiteSpaces = this.generateWhiteSpaces(
				31,
				I18n.t('words.s.activity').length + I18n.t('words.s.balance').length
			)
			accountBalanceSize = '0:1'
		}

		let xmlStatements = `
      <white-mode>
        <text size="${accountBalanceSize}">${I18n.t(
			'customerAccount.currentBalance'
		).toUpperCase()}${accountBalanceWhiteSpaces}</text>
        <bold><text size="${accountBalanceSize}">${customer.accountBalance}</text></bold>
      </white-mode>
      <line-feed />
      <line-feed />
      <small>
        <align mode="center">
          <text-line>${I18n.t('customerAccount.printAccountStatementLabel')}</text-line>
        </align>
      </small>
      <line-feed />
      <text>${removeAccents(I18n.t('words.s.activity'))}${statementsHeaderWhiteSpaces}</text>
      <text>${I18n.t('words.s.balance')}</text>
      <line-feed />
      <text>${this.generateLineSeparator()}</text>
      <line-feed />
    `

		customer.accountStatements.forEach((statement) => {
			const movementNumber = `#${statement.movementNumber} - `
			const reasonWhiteSpaces = this.generateWhiteSpaces(
				this.printerConfig.paperType === '58mm' ? 31 : 48,
				statement.reason.length + statement.value.toString().length,
				'.'
			)
			const dateCreationWhiteSpaces = this.generateWhiteSpaces(
				this.printerConfig.paperType === '58mm' ? 31 : 48,
				movementNumber.length + statement.dateCreation.length + statement.newCurrent.toString().length,
				'.'
			)
			xmlStatements += `
        <text>${movementNumber}</text>
        <text>${statement.dateCreation}${dateCreationWhiteSpaces}</text>
        <text>${statement.newCurrent}</text>
        <line-feed/>
        <bold><text>${statement.reason}${reasonWhiteSpaces}</text></bold>
        <bold><text>${statement.value}</text></bold>
        <line-feed />
        <line-feed />
      `
		})
		return xmlStatements
	}

	generateCustomerStatementsFooter(footerMessage, count) {
		let xmlFooter = `<line-feed />`
		if (count > 10) {
			xmlFooter += `
      <align mode="center">
        <white-mode>
          <text-line>${removeAccents(I18n.t('customerAccount.printAccountStatementInfo'))
						.replace('$movementCount', count >= 10 ? 10 : count)
						.replace('$totalMovement', count)}</text-line>
        </white-mode>
      </align>
      <line-feed />
      <line-feed />
      `
		}
		xmlFooter += `
      <align mode="center">
        <text-line>${footerMessage || ''}</text-line>
      </align>
    `
		return xmlFooter
	}

	generateReceiptItems(itemsQuantity, items) {
		let xmlReceiptItems = `
      <line-feed />
      <bold>
        <small>
          <text-line>${itemsQuantity}</text-line>
        </small>
      </bold>
      <text-line>${this.generateLineSeparator()}</text-line>
    `
		items.forEach((item) => {
			const { quantity, name, value, unitValue, discountValue, discountPercent, isFractioned, variations } = item
			let discount = ''
			let discountWhiteSpaces = ''
			if (discountValue) {
				discount = discountValue ? `${I18n.t('words.s.discountAbbr')}: ${discountValue} (${discountPercent})` : ''
				discountWhiteSpaces = this.generateWhiteSpaces(33, discount.length, '.')
				if (this.printerConfig.paperType === '58mm') {
					discountWhiteSpaces = this.generateWhiteSpaces(20, discount.length, '.')
				}
			}

			const itemName = name.trim().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
			const formattedName = itemName + this.generateItemWhiteSpaces(`${quantity} x ${itemName}`, value)
			const itemDiscount = `${discountWhiteSpaces}${discount}`

			xmlReceiptItems += `
        <line-feed />
        <bold>
          <text>${quantity} x ${formattedName}</text>
          <text>${value}</text>
        </bold>
      `

			if (variations) {
				xmlReceiptItems += `
          <line-feed />
          <text>${variations}</text>
        `
			}

			if (quantity > 1 || isFractioned) {
				xmlReceiptItems += `
          <line-feed />
          <text>${unitValue}${itemDiscount}</text>
        `
			}
		})
		return xmlReceiptItems
	}

	generateSaleSubtotal(saleSubtotal) {
		return `
      <bold>
        <text-line>${saleSubtotal}</text-line>
      </bold>
    `
	}

	generateSaleDiscount(saleDiscount) {
		return `
      <bold>
        <text-line>${saleDiscount}</text-line>
      </bold>
    `
	}

	generateShippingFee(shippingFeeText) {
		return `
      <bold>
        <text-line>${shippingFeeText}</text-line>
      </bold>
    `
	}

	generateShippingCouponTag(appliedCoupon) {
		return `
		<subtotal padding-top="10px">
			<coupon-container
				display="inline-flex"
				align-items="center"
				justify-content="center"
			>
				<label>${I18n.t('coupons.coupon')}:</label>

				<coupon-tag
					display="inline-flex"
					align-items="center"
					justify-content="center"
					margin-left="8px"
					padding="4px 8px"
					border-radius="999px"
					background-color="rgba(21,24,30,0.04)"
					text-transform="uppercase"
					color="rgba(21,24,30,0.48)"
				>
					<icon>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.99942 4.01677C8.26332 4.01677 8.47695 4.2304 8.47695 4.49431V5.41205C8.67555 5.4573 8.86246 5.5316 9.03071 5.64148C9.34408 5.84624 9.5572 6.14833 9.66924 6.51334C9.74653 6.76555 9.60408 7.0332 9.35192 7.11065C9.09979 7.18781 8.83285 7.04615 8.75539 6.79411C8.70183 6.61954 8.61504 6.51174 8.50806 6.44179C8.39506 6.36798 8.22165 6.31197 7.96286 6.3119C7.38968 6.3119 7.20634 6.60264 7.20611 6.81277C7.20612 6.9198 7.22287 6.97558 7.23645 7.0041C7.24796 7.02821 7.26738 7.05626 7.31733 7.09043C7.44381 7.17683 7.69218 7.25931 8.18452 7.34631C8.66934 7.43334 9.12304 7.55313 9.44992 7.8114C9.82132 8.10509 9.96164 8.51495 9.96167 8.99358C9.96165 9.44495 9.78597 9.85255 9.42658 10.1345C9.16743 10.3378 8.84114 10.4529 8.47695 10.4977V11.3564C8.47675 11.6201 8.2632 11.8339 7.99942 11.8339C7.73563 11.8339 7.52208 11.6201 7.52188 11.3564V10.4643C7.24583 10.4093 6.99535 10.313 6.77913 10.1672C6.41053 9.91847 6.17942 9.55599 6.08227 9.13124C6.02349 8.874 6.18435 8.61764 6.44159 8.55882C6.69876 8.50011 6.95514 8.661 7.01401 8.91813C7.06182 9.1271 7.1628 9.27381 7.31344 9.37545C7.47233 9.48257 7.72455 9.56444 8.10675 9.56444C8.49009 9.56441 8.7163 9.47648 8.83627 9.38245C8.94096 9.30031 9.0058 9.18309 9.00582 8.99358C9.0058 8.71554 8.93593 8.62339 8.85727 8.56115C8.73375 8.46356 8.49508 8.37232 8.01808 8.2866C7.53283 8.20085 7.09392 8.0947 6.77835 7.87906C6.60751 7.76225 6.46705 7.61025 6.37392 7.41475C6.28289 7.22355 6.25027 7.01824 6.25026 6.81277C6.25045 6.04338 6.81799 5.54819 7.52188 5.40271V4.49431C7.52188 4.2304 7.73551 4.01677 7.99942 4.01677Z" fill="#15181E" fill-opacity="0.48"/>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M12.4707 0.800781C13.9723 0.800781 15.1998 2.02768 15.1998 3.5299V6.16569C15.1998 6.42905 14.9864 6.64321 14.723 6.644C13.9742 6.64577 13.3682 7.25251 13.3682 8.00117C13.3684 8.74972 13.9739 9.35556 14.7223 9.35678C14.9859 9.3572 15.1998 9.57148 15.1998 9.8351V12.4709C15.1998 13.9731 13.9723 15.2008 12.4707 15.2008H3.52814C2.02559 15.2008 0.799805 13.973 0.799805 12.4709V9.83121C0.799805 9.5673 1.01343 9.3529 1.27734 9.3529C1.3005 9.3529 1.32043 9.3552 1.33567 9.35678C2.07847 9.34983 2.67867 8.7461 2.67884 8.00117C2.67884 7.25582 2.07831 6.65018 1.33567 6.64322C1.32042 6.64481 1.30055 6.64789 1.27734 6.64789C1.01343 6.64789 0.799805 6.43348 0.799805 6.16957V3.5299C0.799805 2.02779 2.02559 0.800781 3.52814 0.800781H12.4707ZM3.52814 1.75586C2.55385 1.75586 1.75488 2.55516 1.75488 3.5299V5.72859C2.82553 5.93133 3.6347 6.8724 3.6347 8.00117C3.63454 9.12995 2.82517 10.0688 1.75488 10.2714V12.4709C1.75488 13.4456 2.55385 14.2449 3.52814 14.2449H12.4707C13.4443 14.2449 14.244 13.4455 14.244 12.4709V10.2621C13.1975 10.0409 12.4133 9.11323 12.4131 8.00117C12.4131 6.88873 13.1974 5.95951 14.244 5.73792V3.5299C14.244 2.55527 13.4443 1.75586 12.4707 1.75586H3.52814ZM1.23145 10.3064C1.233 10.3066 1.23486 10.3062 1.2369 10.3064C1.23067 10.3055 1.22606 10.3051 1.22445 10.3049C1.22623 10.3051 1.22871 10.3061 1.23145 10.3064ZM1.23145 5.69437C1.22872 5.6947 1.22623 5.69567 1.22445 5.69593C1.22609 5.69566 1.23063 5.6945 1.2369 5.69359C1.23483 5.69381 1.23302 5.69418 1.23145 5.69437Z" fill="#15181E" fill-opacity="0.48"/>
						</svg>
					</icon>
					<text-line margin-left="4px">
						${appliedCoupon}
					</text-line>
				</coupon-tag>
			</coupon-container>
		</subtotal>
	`
	}

	generateSaleTax(tax) {
		const { name, percent, taxValue, typePercentFixed } = tax
		const taxPercentLabel = () => (isFixedTax({ typePercentFixed }) ? '' : `(${percent}%)`)
		return `
    <bold>
      <text-line size="0:0">${removeAccents(name)}${taxPercentLabel()}: ${taxValue}</text-line>
    </bold>
  `
	}

	generateSaleTotal(receiptTotal) {
		return `
      <line-feed />
      <bold>
        <text-line size="1:0">${receiptTotal}</text-line>
      </bold>
    `
	}

	generateSalePaymentsHeader(salePaymentsHeader) {
		return `<text-line>${salePaymentsHeader}</text-line>`
	}

	generateSalePayments(salePayments) {
		return `
      <text>${salePayments}</text>
      <line-feed />
    `
	}

	generateSalePayback(salePayback) {
		return `
      <bold>
        <text-line>${salePayback}</text-line>
      </bold>
    `
	}

	generateSaleObservations(saleObservations) {
		return `
      <text-line>${this.generateLineSeparator()}</text-line>
      <small>
        <text-line>${saleObservations}</text-line>
      </small>
    `
	}

	generateSaleCustomer(saleCustomer) {
		const { name, celPhone, address, addressComplement, accountBalance } = saleCustomer
		const customerAddressComplement = addressComplement ? ` - ${addressComplement}` : ''

		let customerWhiteSpaces = ''
		if (celPhone) {
			const totalLength = name.length + celPhone.toString().length
			customerWhiteSpaces = this.generateWhiteSpaces(62 - name.length, totalLength)
		}

		if (this.printerConfig.paperType === '58mm') {
			customerWhiteSpaces = this.generateWhiteSpaces(38, name.length)
			if (celPhone) {
				const totalLength = name.length + celPhone.toString().length
				customerWhiteSpaces = this.generateWhiteSpaces(37 - name.length, totalLength)
			}
		}

		let xmlCustomer = `
      <line-feed />
      <text-line>${this.generateLineSeparator()}</text-line>
      <text>${name ? name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '') + customerWhiteSpaces : ''}</text>
    `

		if (celPhone) {
			xmlCustomer += `<text>${celPhone}</text>`
		}

		if (accountBalance) {
			xmlCustomer += `
        <line-feed />
        <text>${accountBalance}</text>
      `
		}

		if (address) {
			xmlCustomer += `
        <line-feed />
        <small>
          <text>${address}${customerAddressComplement}</text>
        </small>
      `
		}
		xmlCustomer += '<line-feed />'
		return xmlCustomer
	}

	generateReceiptFooter(saleFooter) {
		const { footerExtra, dateCreation } = saleFooter
		let xmlFooter = `
      <align mode="center">
    `
		if (footerExtra) {
			xmlFooter += `<text-line>${footerExtra}</text-line>`
		}
		xmlFooter += `
        <text-line>${dateCreation}</text-line>
      </align>
      <line-feed />
      <line-feed />
      <line-feed />
      <paper-cut/>
    `
		return xmlFooter
	}

	generatePrinterTest() {
		this.xmlBuilt = `
      <?xml version="1.0" encoding="UTF-8"?>
      <document>
        <line-feed />
        <align mode="center">
          <text-line size="3:2">KYTE</text-line>
          <line-feed />
          <text-line size="0:1">${removeAccents(I18n.t('storePrinterTestFirstMessage'))}</text-line>
          <text-line size="0:1">${removeAccents(I18n.t('storePrinterTestSecondMessage'))}</text-line>
          <line-feed />
          <text-line>${this.printerName}</text-line>
          <line-feed />
          <line-feed />
        </align>
        <line-feed />
        <paper-cut/>
      </document>
    `
		return this
	}

	buildSaleReceipt(receipt) {
		const {
			saleStore,
			storeLabel,
			itemsQuantityHeader,
			receiptItems,
			saleSubtotal,
			saleDiscount,
			receiptSaleTax,
			receiptSaleShippingFee,
			receiptTotal,
			receiptProductTax,
			salePaymentsHeader,
			salePayments,
			salePayback,
			saleObservations,
			saleCustomer,
			saleFooter,
			showShippingCouponTag,
			appliedCoupon,
		} = receipt
		this.xmlBuilt = `
    <?xml version="1.0" encoding="UTF-8"?>
    <document>
      ${this.generateStoreHeader(saleStore, storeLabel)}
      ${this.generateReceiptItems(itemsQuantityHeader, receiptItems)}
      <line-feed />
      <text-line>${this.generateLineSeparator()}</text-line>
      ${saleSubtotal ? this.generateSaleSubtotal(saleSubtotal) : ''}
      ${saleDiscount ? this.generateSaleDiscount(saleDiscount) : ''}
      ${receiptSaleShippingFee ? this.generateShippingFee(receiptSaleShippingFee) : ''}
			${showShippingCouponTag ? this.generateShippingCouponTag(appliedCoupon?.code || appliedCoupon?.name) : ''}
      ${receiptSaleTax ? this.generateSaleTax(receiptSaleTax) : ''}
      ${this.generateSaleTotal(receiptTotal)}
      ${receiptProductTax ? this.generateSaleTax(receiptProductTax) : ''}
      ${salePaymentsHeader ? this.generateSalePaymentsHeader(salePaymentsHeader) : ''}
      ${salePayments ? this.generateSalePayments(salePayments) : ''}
      ${salePayback ? this.generateSalePayback(salePayback) : ''}
      ${saleObservations ? this.generateSaleObservations(saleObservations) : ''}
      ${saleCustomer ? this.generateSaleCustomer(saleCustomer) : ''}
      <text-line>${this.generateLineSeparator()}</text-line>
      ${this.generateReceiptFooter(saleFooter)}
    </document>
  `
		return this
	}

	buildCustomerStatements(statements) {
		const { storeInfo, customer, statementsCount } = statements
		this.xmlBuilt = `
      <?xml version="1.0" encoding="UTF-8"?>
      <document>
        ${this.generateCustomerStatementsHeader(storeInfo, customer)}
        <line-feed />
        ${this.generateCustomerStatements(customer)}
        ${this.generateCustomerStatementsFooter(storeInfo.storeFooter, statementsCount)}
        <line-feed />
        <line-feed />
        <line-feed />
        <paper-cut/>
      </document>
    `
		return this
	}

	print() {
		if (!this.xmlBuilt) {
			return false
		}

		return new Promise(async (resolve, reject) => {
			const { printerId, printerType } = this.printerConfig
			const xml = this.printer.getBufferFromXML(this.xmlBuilt)

			if (printerType === 'ble') {
				const { printerId } = this.printerConfig
				await manager
					.isDeviceConnected(printerId)
					.then(async (isConnected) => {
						if (!isConnected) {
							await manager
								.connectToDevice(printerId, { autoConnect: false })
								.then((device) => device.discoverAllServicesAndCharacteristics())
								.then((device) => device.services())
								.then(async (deviceServices) => {
									let localCharacteristic
									for (let i = 0; i < deviceServices.length; i++) {
										const eachServiceCharacteristic = await deviceServices[i].characteristics()
										for (let j = 0; j < eachServiceCharacteristic.length; j++) {
											if (eachServiceCharacteristic[j].isWritableWithoutResponse) {
												localCharacteristic = eachServiceCharacteristic[j]
												break
											}
										}

										if (localCharacteristic) {
											break
										}
									}

									for (let z = 0; z < xml.length; z += BLE_CHUNK_SIZE) {
										const chunk = Buffer.from(xml.slice(z, z + BLE_CHUNK_SIZE))
										await manager.writeCharacteristicWithoutResponseForDevice(
											printerId,
											localCharacteristic.serviceUUID,
											localCharacteristic.uuid,
											chunk.toString('base64')
										)
									}

									setTimeout(async () => {
										await manager.isDeviceConnected(printerId).then(async (isConnected) => {
											if (isConnected) {
												await manager.cancelDeviceConnection(printerId)
											}
										})

										resolve()
									}, 3000)
								})
								.catch((error) => reject(error))
						}
					})
					.catch((error) => reject(error))
			} else {
				await RNBluetoothClassic.isDeviceConnected(printerId)
					.then(async (isConnected) => {
						if (!isConnected) {
							await RNBluetoothClassic.connectToDevice(printerId)
						}

						for (let z = 0; z < xml.length; z += CLASSIC_CHUNK_SIZE) {
							const chunk = Buffer.from(xml.slice(z, z + CLASSIC_CHUNK_SIZE))
							await RNBluetoothClassic.writeToDevice(printerId, chunk)
						}

						await RNBluetoothClassic.disconnectFromDevice(printerId)
						resolve()
					})
					.catch((error) => reject(error))
			}
		})
	}
}

export { KytePrint }
