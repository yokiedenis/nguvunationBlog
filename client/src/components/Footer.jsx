import {
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import LogoWhite from "../img/logo-white.webp";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import "../index.css";

const Footer = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/subscribe`,
        data
      );
      toast.success(response.data.message);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  // Footer links data for cleaner JSX
  const footerLinks = [
    {
      title: "Nguvu Nation",
      links: [
        { text: "Crafts shop", to: "/events" },
        { text: "Contact Us", to: "/contact-us" },
        { text: "FAQ's", to: "/faqs" },
        { text: "Gallery", to: "/gallery" }
      ]
    },
    {
      title: "Quick Links",
      links: [
        { text: "Resources", to: "/resources" },
        { text: "Volunteer", to: "/volunteer" },
        { text: "Community", to: "/community" },
        { text: "Spirituality", to: "/spirituality" }
      ]
    },
    {
      title: "Category",
      links: [
        { text: "Mental Health", to: "/mental-health" },
        { text: "Football", to: "/football" },
        { text: "Travel tips", to: "/travel-tips" },
        { text: "Creativity", to: "/creativity" }
      ]
    }
  ];

  return (
    <footer className="bg-black">
      <div className="flex justify-evenly max-lg:flex-col max-lg:items-center max-lg:gap-12 p-20 max-sm:p-10">
        {/* Brand Section */}
        <div className="w-[25%] max-sm:w-full flex flex-col max-lg:items-center max-lg:text-center gap-5">
          <figure>
            <img src={LogoWhite} alt="Nguvu Nation logo" className="max-w-[180px]" />
          </figure>
          <ul className="flex items-center gap-3 text-sm text-white">
            {[
              { Icon: FaFacebookF, name: "Facebook" },
              { Icon: FaTwitter, name: "Twitter" },
              { Icon: FaInstagram, name: "Instagram" },
              { Icon: FaLinkedinIn, name: "LinkedIn" }
            ].map((social, index) => (
              <li 
                key={index}
                className="p-3 rounded-md cursor-pointer bg-[#e7739a] text-[#34b9be] hover:bg-cyan-500 transition-all duration-200"
                aria-label={social.name}
              >
                <social.Icon />
              </li>
            ))}
          </ul>
        </div>

        {/* Links Sections */}
        <div className="flex justify-evenly gap-10 max-[561px]:flex-col max-[561px]:gap-6 text-center mx-5px w-full max-w-3xl">
          {footerLinks.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="wavyHeading">
                <h5 className="text-white">Nguvunation</h5>
                <h5>
                  <span className="text-[#e7739a]">Nguvu</span>
                  <span className="text-[#34b9be]">nation</span>
                </h5>
              </div>
              <ul className="text-white mt-5 text-base flex flex-col gap-2">
                {section.links.map((link, linkIndex) => (
                  <li 
                    key={linkIndex}
                    className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border border-cyan-500 text-[#34b9be] transition-all duration-200"
                  >
                    <Link to={link.to}>{link.text}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-black text-white text-center py-5 flex justify-between items-center max-sm:flex-col max-sm:gap-4 px-5 border-t border-gray-800">
        <div className="text-sm">
          <span className="text-gray-400">Powered by </span>
          <span className="text-[#e7739a]">A'kidi</span>
          <span className="text-gray-400 mx-1">and</span>
          <span className="text-[#34b9be]">yoki3</span>
        </div>
        
        <p className="text-sm">
          © 2025{" "}
          <Link to="/" className="text-[#34b9be] hover:underline">
            Nguvu Nation Foundation
          </Link>
        </p>
        
        <button 
          className="bg-[#e7739a] hover:bg-cyan-500 text-white flex items-center gap-2 text-sm transition-all duration-200 py-2 px-4 rounded-lg"
          onClick={() => toast.info("Share feature coming soon!")}
        >
          Share your thinking <BsArrowRight />
        </button>
      </div>
    </footer>
  );
};

export default Footer;