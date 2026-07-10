import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

export const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="main_wrapper">
        <div className="main">
          <div className="antenna">
            <div className="antenna_shadow" />
            <div className="a1" />
            <div className="a1d" />
            <div className="a2" />
            <div className="a2d" />
            <div className="a_base" />
          </div>
          <div className="tv">
            <div className="cruve">
              <svg className="curve_svg" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 189.929 189.929">
                <path d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13
        C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z" fill="#000" />
              </svg>
            </div>
            <div className="display_div">
              <div className="screen_out">
                <div className="screen_out1">
                  <div className="screen">
                    <span className="notfound_text">NOT FOUND</span>
                  </div>
                  <div className="screenM">
                    <span className="notfound_text">NOT FOUND</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lines">
              <div className="line1" />
              <div className="line2" />
              <div className="line3" />
            </div>
            <div className="buttons_div">
              <div className="b1"><div /></div>
              <div className="b2" />
              <div className="speakers">
                <div className="g1">
                  <div className="g11" />
                  <div className="g12" />
                  <div className="g13" />
                </div>
                <div className="g" />
                <div className="g" />
              </div>
            </div>
          </div>
          <div className="bottom">
            <div className="base1" />
            <div className="base2" />
            <div className="base3" />
          </div>
        </div>
        <div className="text_404">
          <div className="text_4041">4</div>
          <div className="text_4042">0</div>
          <div className="text_4043">4</div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 text-center z-10">
        <h1 className="text-2xl font-bold tracking-tight">Oops! Page not found</h1>
        <p className="text-sm text-neutral-500 max-w-sm">
          The page you are looking for doesn't exist, is temporarily unavailable, or has been relocated.
        </p>
        <Link
          to="/dashboard"
          className="mt-2 px-5 py-2.5 bg-[#FF6B35] hover:bg-[#FF7F50] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand/10 hover:shadow-brand/20 select-none cursor-pointer"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
