import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { ProductList } from "../pages/Home/styles";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface ProductAmount {
  id: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateStock: (productId: number, type: string) => void;
  verifyAvailability: (productId: number) => boolean;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });
  const [itemsAmount, setItemsAmount] = useState<ProductAmount[]>([]);

  useEffect(() => {
    async function loadStock() {
      await api
        .get("http://localhost:3333/stock")
        .then((response) => setItemsAmount(response.data));
    }

    loadStock();
  }, []);

  const verifyAvailability = (productId: number) => {
    const result = itemsAmount.find((item) => item.id === productId);
    if (result) {
      return result.amount > 0;
    }

    return false;
  };

  const addProduct = async (productId: number) => {
    try {
      if (verifyAvailability(productId)) {
        if (!cart.some((item) => item.id === productId))
          await api
            .get(`http://localhost:3333/products/${productId}`)
            .then((response) => {
              let newItem = response.data;
              newItem.amount = 1;

              setCart([...cart, newItem]);
            });
        else {
          const updatedCart = cart.map((item) => {
            if (item.id === productId) item.amount++;

            return item;
          });

          setCart(updatedCart);
        }

        updateStock(productId, "decrement");
      } else {
        // console.log("No items in stock");
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const filteredCart = cart.filter((item) => item.id !== productId);

      setCart(filteredCart);
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const newCart = cart.map((item) => {
        if (item.id === productId) item.amount = amount;

        return item;
      });
      setCart(newCart);
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  const updateStock = (productId: number, type: string) => {
    const newStock = itemsAmount.map((item) => {
      if (item.id === productId) {
        if (type === "increment") {
          debugger;
          item.amount++;
        } else if (type === "decrement") item.amount--;
        else if (type === "byAmount") {
          const removedItem = cart.find((result) => result.id === productId);
          item.amount += removedItem?.amount!;
        }
      }

      return item;
    });

    setItemsAmount(newStock);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        verifyAvailability,
        updateStock,
        addProduct,
        removeProduct,
        updateProductAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
