import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import blog1 from "../img/blog1.webp";
import feature1 from "../img/feature-1.webp";
import testimonial1 from "../img/testimonial-1.webp";
import feature2 from "../img/feature-2.webp";
import aboutShare from "../img/about-share.webp";
import team2 from "../img/team-2.webp";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFacebookF,
  FaLinkedinIn,
  FaPlay,
  FaTwitter,
} from "react-icons/fa";
import ReactPlayer from "react-player";
import { BsArrowRight } from "react-icons/bs";
import Slider from "react-slick";

const AboutUs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 792,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  let sliderRef = useRef(null);
  const next = () => {
    sliderRef.slickNext();
  };
  const previous = () => {
    sliderRef.slickPrev();
  };
  return (
    <>
      <section className="">
        <div className="flex justify-center items-center bg-custom-exlight-orange py-24">
          <span className="bg-[#e7739a]   rounded-md px-4 py-2 text-base font-medium">
            <Link to="/">Home</Link> /{" "}
            <Link to="/about-us" className="text-white">
              About Us
            </Link>
          </span>
        </div>
      </section>
      <section>
        <div className="w-full relative px-24 mt-16 max-sm:px-5">
          <figure className="h-[500px] max-sm:h-[250px]">
            <img
              src={blog1}
              alt=""
              className="rounded-xl h-full w-full object-cover"
            />
          </figure>
          <button
            onClick={openModal}
            className="absolute top-[45%] max-sm:top-[35%] max-sm:left-[40%] hover:bg-orange-400 transition-all ease-in-out duration-200 left-[48%] text-white bg-orange-300 p-5 rounded-full text-2xl border-2 border-white"
          >
            <FaPlay />
          </button>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-[70%] mx-auto">
              <button
                className="absolute -top-[10%] right-0 text-5xl text-white"
                onClick={closeModal} // Close modal on click
              >
                &times;
              </button>
              <ReactPlayer
                url="https://youtu.be/dYakdOrjnZc" // Replace with your video URL
                controls
                playing
                width="100%"
                height="500px"
              />
            </div>
          </div>
        )}
      </section>
      <section>
        <div className="mt-[5rem] px-24 flex gap-5 max-lg:flex-col max-sm:px-5">
          <div className="bg-custom-exlight-orange p-10 w-[35%] flex flex-col max-lg:w-full gap-2 rounded-xl">
            <figure className="bg-custom-orange w-fit p-3 rounded-md">
              <img src={feature1} alt="Feature image" />
            </figure>
            <h4 className="text-2xl font-semibold text-custom-black">
            OUR OBJECTIVES
            </h4>
            <p className="text-sm leading-6">
            1.To eliminate gender inequalities in primary and secondary education by achieving equality in
education, with ensuring girl ’ s full and equal access to basic education, and free access to
menstration products
            </p>
            <p className="text-sm leading-6">
            2. Empower young girls be financially independent through capacity building
            </p>
            <p className="text-sm leading-6">
            3. To strive for a gender violent free community safe for young girls.
            </p>
            <p className="text-sm leading-6">
            4. To raise awareness, understanding and knowledge about sanitation and malaria prevention
            </p>
            <p className="text-sm leading-6">
            5. To make campaigns like go green through planting trees, using environmentally friendly products
            and install cost effective home energy.
            </p>

          </div>
          <div className="bg-custom-exlight-orange p-10 w-[63%] max-lg:w-full flex gap-3 rounded-xl max-xl:flex-col">
            <div className="w-1/2 flex flex-col gap-2 max-xl:w-full">
              <figure className="bg-custom-orange w-fit p-3 rounded-md">
                <img src={feature2} alt="Feature image" />
              </figure>
              <h4 className="text-2xl font-semibold text-custom-black">
                OUR VALUES
              </h4>
              <p className="text-sm leading-6">
              1. Believe in the power of committed youth individuals and organizations that
              contribute to a sustainable development.
              </p>
              <p className="text-sm leading-6">
              2. Working with efficiency, efficacy and long term sustainability
              </p>
              <p className="text-sm leading-6">
              3. We believe in committed, selfless, godly and service oriented individuals who want to make a
              positive impact to their communities.
              </p>
              <p className="text-sm leading-6">
              4. We value the principle of social justice, and empowerment of youth, and women.
              </p>
            </div>
            <div className="w-1/2 max-xl:w-full">
              <figure className="relative">
                <img
                  src={aboutShare}
                  alt="about share"
                  className="max-xl:w-full max-xl:h-full max-lg:h-[300px] object-cover max-lg:rounded-xl"
                />
                <button className="bg-orange-300 hover:bg-orange-400 text-custom-black hover:text-white flex items-center gap-2 text-[15px] transition-all ease-in-out duration-200 py-3 font-medium px-3 rounded-lg absolute bottom-[8%] left-[18%]">
                  Share your thinking <BsArrowRight />
                </button>
              </figure>
            </div>
          </div>
        </div>
      </section>
      <section className="px-24 mt-[5rem] max-sm:px-5">
        <div className="flex gap-5 border-y border-gray-200 max-lg:flex-col py-10">
          <div className="w-1/2 flex items-center justify-center text-center max-lg:w-full">
            <h3 className="text-5xl leading-[4rem]">
              You Can Volunteer And tagline 
              <span className="font-semibold text-cyan-500"> N</span><span className="font-semibold text-[#e7739a]">guvu N</span><span className="font-semibold text-cyan-500">ation.</span>
            </h3>
          </div>
          <div className="w-1/2 flex flex-col max-lg:w-full max-lg:flex-row max-md:flex-col">
            <div className="flex flex-col gap-3 border-x max-lg:border border-gray-200 p-8 border-b">
              <h4 className="text-2xl font-semibold">Our Vision</h4>
              <p>
              Nguvu Nation is set out to uplift, support , empower and rewrite the narratives of young girls with
purpose through community based advocacy programs, training like sanitation awareness, home
energy installations, health care programs, women economic empowerment, eradication of gender
based violence, vocational and agricultural training
              </p>
              <h4 className="text-2xl font-semibold">Our Mission</h4>
              <p>our goal is to have an impact on the lives of young girls by providing positive and godly impact
              oriented, cost effective and culturally competent capacity building programs.</p>
            </div>
            <div className="flex flex-col gap-3 border-x max-lg:border border-gray-200 p-8">
              <h4 className="text-2xl font-semibold">Nguvu Nation History</h4>
              <p>
              NGUVU is a Swahili word that means *strong*
Nguvu Nation is an organization directed towards uplifting, supporting and empowering young
girls between the ages of 9 24 through equipping them with a variety of life skills, training,
mentoring as well as educating and sensitizing them for sustainable living and development.
It was founded in 2023 by a group of energetic youth activists, who came together with the
objective of improving and upgrading lives of young girls in Ugandan communities.
They also realized the necessity of this establishment as a means of contributing to development
and meeting communities’ needs which has been the driving force and motivation.
We aim at achieving sustainable results from developmental activities and initiatives to our
communities, especially with the youth, young girls and single mothers.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-24 py-20 max-sm:px-5">
        <div className="flex flex-col gap-1 items-center text-center">
          <small className="font-semibold text-base">
            Meet Our Team Members
          </small>
          <h4 className="font-semibold text-4xl">
            Leadership & Experienced Team
          </h4>
        </div>
        <div className="grid grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-8 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              className="relative group w-full h-full overflow-hidden rounded-lg"
              key={i}
            >
              <img
                src={team2}
                alt="team image"
                className="object-cover w-full h-full rounded-lg"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                {/* Social Icons */}
                <div className="flex gap-3 mt-5">
                  <a
                    href="#"
                    className="p-3 bg-white rounded-md text-sm text-black hover:bg-custom-black hover:text-white transition-colors duration-300"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-white rounded-md text-sm text-black hover:bg-custom-black hover:text-white transition-colors duration-300"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-white rounded-md text-sm text-black hover:bg-custom-black hover:text-white transition-colors duration-300"
                  >
                    <FaLinkedinIn />
                  </a>
                </div>
                {/* Name and Position */}
                <div className="p-5 text-center text-white">
                  <h3 className="text-xl font-semibold">Alexander</h3>
                  <p className="text-sm font-semibold text-custom-orange">
                    Founder
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="px-24 py-20 bg-custom-light-blue max-sm:px-5">
        <div className="flex flex-col gap-1 items-center text-center">
          <small className="font-semibold text-base">Some Testimonial</small>
          <h4 className="font-semibold text-4xl">What People Say About Us</h4>
        </div>
        <div className="mt-[3rem]">
          <div className="relative w-full">
            <div className="">
              <Slider
                ref={(slider) => {
                  sliderRef = slider;
                }}
                {...settings}
              >
                {[1, 2, 3, 4, 5, 6].map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-7 w-full bg-white space-y-3 rounded-xl "
                  >
                    <div className="flex gap-2 items-center">
                      <figure>
                        <img src={testimonial1} alt="" />
                      </figure>
                      <div>
                        <h5 className="font-semibold text-lg">
                          Sherika Hankins
                        </h5>
                        <span className="font-medium text-custom-orange uppercase text-xs">
                          founder
                        </span>
                      </div>
                    </div>
                    <hr />
                    <h4 className="text-lg font-semibold">
                      Printer took a galley of type and scrambled to make book.
                    </h4>
                    <p className="text-sm leading-[1.5rem]">
                      Lorem has been the industry standard dummy text.
                    </p>
                  </div>
                ))}
              </Slider>
            </div>

            <div className="mt-[2rem] flex justify-center gap-3">
              <button
                onClick={previous}
                className="bg-cyan-500 outline-none text-white p-4 text-base rounded-full"
              >
                <FaArrowLeft />
              </button>
              <button
                onClick={next}
                className="bg-cyan-500 outline-none text-white p-4 text-base rounded-full"
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
