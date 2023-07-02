import {it, expect} from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from 'react-redux'
import {initStore} from '../../src/client/store'
import {Application} from '../../src/client/Application'
import { CartApi, ExampleApi } from '../../src/client/api'
import React from "react";
import { addToCart, clearCart } from '../../src/client/store'

  const basename = '/hw/store'

  const api = new ExampleApi(basename)
  let cart = new CartApi()
  const store = initStore(api, cart)

  it('Проверка количества элементов рядом с корзиной в шапке - один элемент', () => {
    

    const good  = {
      id: 1,
      name: 'test',
      price: 100,
      description: 'test',
      material: 'test',
      color: 'test',

    };
    store.dispatch(addToCart(good))

    const application = (
      <BrowserRouter basename={basename}>
          <Provider store={store}>
              <Application />
          </Provider>
      </BrowserRouter>
    );

    const {container} = render(application)

    const elem = screen.getByTestId('cart-label')
  
    expect(Object.keys(store.getState().cart).length).toBe(1)
    expect(elem.textContent).toBe('Cart (1)')
  })

  it('Проверка количества элементов рядом с корзиной в шапке - 0 элементов', () => {
    
    store.dispatch(clearCart())

    const application = (
      <BrowserRouter basename={basename}>
          <Provider store={store}>
              <Application />
          </Provider>
      </BrowserRouter>
    );

    const {container} = render(application)

    const elem = screen.getByTestId('cart-label')
  
    expect(Object.keys(store.getState().cart).length).toBe(0)
    expect(elem.textContent).toBe('Cart')
  })

  
 