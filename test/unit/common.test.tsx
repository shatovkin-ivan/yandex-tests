import {it, expect} from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from 'react-redux'
import {initStore} from '../../src/client/store'
import {Application} from '../../src/client/Application'
import { CartApi, ExampleApi } from '../../src/client/api'
import React from "react"
import events from '@testing-library/user-event'


    
const basename = '/hw/store';
const api = new ExampleApi(basename);
let cart = new CartApi();
const store = initStore(api, cart);

it('в шапке отображаются ссылки на страницы магазина, корзину', async () => {

    const application = (
        <BrowserRouter basename={basename}>
            <Provider store={store}>
                <Application />
            </Provider>
        </BrowserRouter>
      );
  
      render(application)

        let linkMain = screen.getByRole('link', {name: 'Example store'})
        let linkCatalog = screen.getByRole('link', {name: 'Catalog'})
        let linkDelivery = screen.getByRole('link', {name: 'Delivery'})
        let linkContacts = screen.getByRole('link', {name: 'Contacts'})
        let linkCart = screen.getByTestId('cart-label')
     
    Promise.all([events.click(linkMain), events.click(linkCatalog), events.click(linkDelivery),
      events.click(linkContacts), events.click(linkCart)]).then( () => {
      expect(linkMain.getAttribute('href')).toBe('/hw/store/')
      expect(linkCatalog.getAttribute('href')).toBe('/hw/store/catalog')
      expect(linkDelivery.getAttribute('href')).toBe('/hw/store/delivery')
      expect(linkContacts.getAttribute('href')).toBe('/hw/store/contacts')
      expect(linkCart.getAttribute('href')).toBe('/hw/store/cart')
    })
  
})

it('название магазина в шапке должно быть ссылкой на главную страницу', async () => {

  const application = (
      <BrowserRouter basename={basename}>
          <Provider store={store}>
              <Application />
          </Provider>
      </BrowserRouter>
    );

   render(application)
   let link = screen.getByRole('link', {name: 'Example store'})
   await events.click(link)
   expect(link.getAttribute('href')).toBe('/hw/store/')
})