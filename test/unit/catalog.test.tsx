import {it, expect} from '@jest/globals'
import { render, waitFor, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { initStore } from '../../src/client/store'
import { Catalog } from '../../src/client/pages/Catalog'
import { CartApi } from '../../src/client/api'
import React from "react";
import { productsLoaded } from '../../src/client/store'
import { CartState, CheckoutFormData, Product, ProductShortInfo } from '../../src/common/types'
import { ProductItem } from '../../src/client/components/ProductItem'
import { ProductDetails } from '../../src/client/components/ProductDetails'
import events from '@testing-library/user-event'
import { Cart } from '../../src/client/pages/Cart'
import { addToCart } from '../../src/client/store'

const basename = '/hw/store';
const cart = new CartApi();


export class ExampleApi {
  constructor(private readonly basename: string) {

  }

  async getProducts(): Promise<{data: ProductShortInfo[]}> {
      return Promise.resolve({
        data: [
          {id: 0, name: 'Sleek Bike', price: 781 },
          {id: 1, name: 'Intelligent mouse', price: 881 }
        ]
      })
  }

  async getProductById(id: number): Promise<{data: Product}> {
      return Promise.resolve({
        data: {
          id: 0,
          name: 'Sleek Bike',
          price: 781,
          color: 'cyan',
          material: 'Rubber',
          description: 'test',
        }
      })
  }

  async checkout(form: CheckoutFormData, cart: CartState) {
  }
}

const api = new ExampleApi(basename)
/* @ts-ignore */
const store = initStore(api, cart);

it ('в каталоге должны отображаться товары с сервера', async () => {
    const products = await api.getProducts()
    
    store.dispatch(productsLoaded(products.data))
    
    const application = (
      <BrowserRouter basename={basename}>
        <Provider store={store}>
            <Catalog />
        </Provider>
      </BrowserRouter>
    )

    const {container, getByText, getAllByTestId, getByTestId} = render(application)
    
    expect(getByText('LOADING')).toBeDefined()
    
    
    await waitFor(() => { expect(getAllByTestId(/[0-1]/i)).toBeDefined()})
})

it('для каждого товара есть название, цена и ссылка на инфо', async () => {
  const products = await api.getProducts()
    
  store.dispatch(productsLoaded(products.data))

  const application = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
      {products.data.map(p => (
        <ProductItem product={p} />
      ))}
      </Provider>
    </BrowserRouter>
  )
  const {container} = render(application)

expect(container.querySelector('.card-title')?.textContent).toBe('Sleek Bike')
expect(container.querySelector('.card-text')?.textContent).toBe('$781')
expect(container.querySelector('.card-link')?.getAttribute('href')).toBe('/hw/store/catalog/0')
})

it('На странице с инфо есть название, цена, материал, цвет, кнопка добавления в корзину', async () => {
  const product = await api.getProductById(0)
    
  const application = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <ProductDetails product={product.data} />
      </Provider>
    </BrowserRouter>
  )

  const { container } = render(application)
 
  expect(container.querySelector('.ProductDetails-Name')?.textContent).toBe('Sleek Bike')
  expect(container.querySelector('.ProductDetails-Description')?.textContent).toBe('test')
  expect(container.querySelector('.ProductDetails-Price')?.textContent).toBe('$781')
  expect(container.querySelector('.ProductDetails-Color')?.textContent).toBe('cyan')
  expect(container.querySelector('.ProductDetails-Material')?.textContent).toBe('Rubber')

}) 

it('если товар  добавлен в корзину, в каталоге и на деталке есть сообщение об этом', async() => {
  const product = await api.getProductById(0)
  
  const application = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <ProductDetails product={product.data} />
        <Catalog />
      </Provider>
    </BrowserRouter>
  )

  const { container, getAllByTestId } = render(application)
 
  await waitFor(() => { expect(getAllByTestId(0)).toBeDefined()})
  /* @ts-ignore */
  let cartButton: Element = container.querySelector('.ProductDetails-AddToCart')

  await events.click(cartButton)
  
  expect(container.querySelector('p .CartBadge')?.textContent).toBe('Item in cart')
  expect(container.querySelector('.card-body .CartBadge')?.textContent).toBe('Item in cart')

})

it('если товар  добавлен в корзину, повторное нажатие увеличит его количество', async() => {
  const product = await api.getProductById(0)
  
  const application = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <Cart />
        <ProductDetails product={product.data} />
      </Provider>
    </BrowserRouter>
  )

  const { container, getAllByTestId } = render(application)
 
  await waitFor(() => { expect(getAllByTestId(0)).toBeDefined()})
  expect(container.querySelector('.Cart-Count')?.textContent).toBe('1')
  /* @ts-ignore */
  let cartButton: Element = container.querySelector('.ProductDetails-AddToCart')
  await events.click(cartButton)

  expect(container.querySelector('.Cart-Count')?.textContent).toBe('2')

})

it('содержимое корзины должно сохраняться между перезагрузками страницы', () => {
  
  const cart = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <Cart />
        
      </Provider>
    </BrowserRouter>
  )

  const { container, getByTestId } = render(cart)

  let itemInCart = getByTestId('0')
  expect(itemInCart).toBeDefined()

  window.location.reload();

  expect(itemInCart).toBeDefined()
  
})

it('в корзине должна отображаться таблица с добавленными в нее товарами', () => {
  const cart = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <Cart />
      </Provider>
    </BrowserRouter>
  )

  const { container, getByTestId } = render(cart)
  let table = container.querySelector('.Cart-Table')
  let itemInCart = getByTestId('0')

  expect(table).toBeDefined()
  expect(itemInCart).toBeDefined()
  
  
})

it('для каждого товара есть название, цена, количество, стоимость, общая сумма заказа', () => {
  const cart = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <Cart />
      </Provider>
    </BrowserRouter>
  )

  const { container, getByTestId } = render(cart)

  expect(getByTestId('0')).toBeDefined()
  expect(container.querySelector('.Cart-Name')?.textContent).toBe('Sleek Bike')
  expect(container.querySelector('.Cart-Price')?.textContent).toBe('$781')
  expect(container.querySelector('.Cart-Count')?.textContent).toBe('2')
  expect(container.querySelector('.Cart-Total')?.textContent).toBe('$1562')
  expect(container.querySelector('.Cart-OrderPrice')?.textContent).toBe('$1562')

})

it('по нажатию на "очистить корзину" товары должны удаляться', async () => {
  const cart = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <Cart />
      </Provider>
    </BrowserRouter>
  )

  const { container, getByTestId } = render(cart)
  
  /* @ts-ignore */
  let cartButton = screen.getByText('Clear shopping cart')
 
  expect(container.querySelector('.Cart-Table')?.textContent).toBeDefined()
  await events.click(cartButton)
  expect(container.querySelector('.Cart-Table')?.textContent).toBeFalsy()
  
})

it('если корзина пустая, должна отображаться ссылка на каталог товаров', async () => {
  
  const good  = {
    id: 1,
    name: 'test',
    price: 100,
    description: 'test',
    material: 'test',
    color: 'test',

  };
  store.dispatch(addToCart(good))

  const cart = (
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <Cart />
      </Provider>
    </BrowserRouter>
  )
  const { container, getByTestId } = render(cart)

  
  
  /* @ts-ignore */
  let cartButton = screen.getByText('Clear shopping cart')
 
  await events.click(cartButton)

  expect(screen.getByRole('link', { name: 'catalog'}).getAttribute('href')).toBe('/hw/store/catalog')
})