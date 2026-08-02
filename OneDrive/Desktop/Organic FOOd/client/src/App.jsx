
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Shop from "./components/pages/Shop";
import NoPageFound from "./components/pages/NoPageFound";
import Services from "./components/pages/Services";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import { ToastContainer } from "react-toastify";
import IsAuthorised from "./components/Auth/IsAuthorised";
import IsAdminAuth from "./components/Auth/IsAdminAuth";
import Posts from "./components/pages/Posts";
import SinglePost from "./components/pages/SinglePost";
import JobsSearch from "./components/pages/JobsSearch";
import ProductDetails from "./components/pages/ProductDetails";
import UserDashboard from "./components/pages/UserDashboard";
import AdminDashboard from "./components/pages/AdminDashboard";
import Cart from "./components/pages/Cart";
import Address from "./components/pages/Address";
import Payment from "./components/pages/Payment";
import OrderSuccess from "./components/pages/Ordersuccess";
import Orders from "./components/pages/Orders";
import ResetPassword from "./components/pages/ResetPassword";
import ForgotPassword from "./components/pages/Forgot-Password";
import UploadProduct from "./components/molecules/UploadProduct";



const App = () => {
  return (
    // jsx fragment
    <>
      <BrowserRouter>


        <ToastContainer
          position="top-left"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Navbar />

        {/* page mount and dismount */}
        <div className="main">
          <Routes>
            <Route path="*" element={<NoPageFound />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:postId" element={<SinglePost />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/jobs" element={<JobsSearch />} />
            <Route path="/services" element={<IsAuthorised>    <Services />  </IsAuthorised>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/user/cart" element={<IsAuthorised role={"user"}><Cart /></IsAuthorised>} />
            <Route path="/user/add/address" element={<IsAuthorised role={"user"}><Address /></IsAuthorised>} />
            <Route path="/user/dashboard" element={<IsAuthorised role={"user"}><UserDashboard /></IsAuthorised>} />
            <Route path="/admin/dashboard" element={<IsAdminAuth><AdminDashboard /></IsAdminAuth>} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/forgot/password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/product/edit/:id" element={<UploadProduct isEdit={true} />} />


          </Routes>
        </div>

        <Footer />
      </BrowserRouter>
    </>
  );
};

export default App;