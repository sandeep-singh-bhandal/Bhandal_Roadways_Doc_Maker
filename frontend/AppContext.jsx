import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true; // to send cookies
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showProductDeleteModal, setShowProductDeleteModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);

  //Fetch Seller Status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) setIsSeller(true);
      else setIsSeller(false);
    } catch (err) {
      setIsSeller(false);
    }
  };
  //Fetch User Status
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch (err) {
      setUser(null);
    }
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Add to cart function
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Item added to cart");
  };

  // Update Cart function
  const updateCart = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  };

  // Remove from cart function
  const removeFromCart = (itemId, all) => {
    let cartData = structuredClone(cartItems);
    if (all) {
      delete cartData[itemId];
      toast.success("Item removed from cart");
    } else {
      cartData[itemId] -= 1;
      toast.success("Item removed from cart");
    }
    setCartItems(cartData);
  };

  // Get cart item count
  const getCartItemCount = () => {
    let count = 0;
    for (const item in cartItems) {
      count += cartItems[item];
    }
    return count;
  };

  // Get cart total amount
  const getCartAmount = () => {
    let amount = 0;
    for (const item in cartItems) {
      let itemInfo = products.find((prod) => prod._id === item);
      if (cartItems[item] > 0) {
        amount += itemInfo.offerPrice * cartItems[item];
      }
    }
    return Math.floor(amount * 100) / 100;
  };

  //fetch reviews for a specific product
  const fetchReviews = async (productId) => {
    const { data } = await axios.get(`api/review/get-reviews/${productId}`);
    setReviews(data.reviews);
  };
  // fetch all reviews
  const fetchAllReviews = async () => {
    const { data } = await axios.get("api/review/get-all-reviews");
    setAllReviews(data.reviews);
  };

  useEffect(() => {
    fetchSeller();
    fetchUser();
    fetchProducts();
  }, []);

  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (user) updateCart();
  }, [cartItems]);

  const value = {
    user,
    setUser,
    isSeller,
    setIsSeller,
    navigate,
    showUserLogin,
    setShowUserLogin,
    fetchUser,
    products,
    currency,
    cartItems,
    setCartItems,
    addToCart,
    updateCart,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    axios,
    getCartItemCount,
    getCartAmount,
    fetchProducts,
    showDeleteAccountModal,
    setShowDeleteAccountModal,
    showProductDeleteModal,
    setShowProductDeleteModal,
    showEditProductModal,
    setShowEditProductModal,
    showReviewModal,
    setShowReviewModal,
    fetchReviews,
    fetchAllReviews,
    reviews,
    setReviews,
    allReviews,
    setAllReviews,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
