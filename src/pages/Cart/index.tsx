import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const {
    cart,
    verifyAvailability,
    removeProduct,
    updateProductAmount,
    updateStock,
  } = useCart();

  // const cartFormatted = cart.map(product => ({
  //   // TODO
  // }))
  // const total =
  //   formatPrice(
  //     cart.reduce((sumTotal, product) => {
  //       // TODO
  //     }, 0)
  //   )

  function handleProductIncrement(product: Product) {
    // TODO
    if (verifyAvailability(product.id)) {
      // console.log("incremented")
      const productUpdates = {
        productId: product.id,
        amount: product.amount + 1,
      };

      updateStock(product.id, "decrement");
      updateProductAmount(productUpdates);
    } else console.log("No more in stock");
  }

  function handleProductDecrement(product: Product) {
    const productUpdates = {
      productId: product.id,
      amount: product.amount > 0 ? product.amount - 1 : 0,
    };
    updateStock(product.id, "increment");
    updateProductAmount(productUpdates);
  }

  function handleRemoveProduct(productId: number) {
    updateStock(productId, "byAmount");
    removeProduct(productId);
  }

  function getCartTotalValue() {
    return cart.reduce((acc, current) => {
      acc += current.price * current.amount;
      return acc;
    }, 0);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr data-testid="product" key={item.id}>
              <td>
                <img src={item.image} alt={item.title} />
              </td>
              <td>
                <strong>{item.title}</strong>
                <span>{formatPrice(item.price)}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={item.amount <= 1}
                    onClick={() => handleProductDecrement(item)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={item.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(item)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{formatPrice(item.price * item.amount)}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(item.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong> {formatPrice(getCartTotalValue())}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
