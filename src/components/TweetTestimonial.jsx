import React, { useState } from 'react';
import { motion } from 'motion/react';

// Official X Verified Checkmark Icon
const VerifiedBadge = () => (
  <svg viewBox="0 0 22 22" aria-label="Verified account" className="w-[18px] h-[18px] text-[#1d9bf0] fill-current flex-shrink-0">
    <g>
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.602.27-1.264.14-1.894-.131-.629-.445-1.207-.907-1.67-.463-.462-1.04-.776-1.67-.907-.63-.13-1.292-.083-1.894.14-.274-.586-.705-1.084-1.246-1.438C12.28 1.958 11.65 1.76 11 1.742c-.65.018-1.28.215-1.816.57-.54.354-.972.852-1.246 1.438-.602-.223-1.264-.27-1.894-.14-.629.131-1.207.445-1.67.907-.462.463-.776 1.04-.907 1.67-.13.63-.083 1.292.14 1.893-.586.274-1.084.705-1.438 1.246-.355.54-.552 1.17-.57 1.816.018.646.215 1.275.57 1.816.354.54.852.972 1.438 1.246-.223.602-.27 1.264-.14 1.894.131.629.445 1.207.907 1.67.463.462 1.04.776 1.67.907.63.13 1.292.083 1.894-.14.274.586.705 1.084 1.246 1.438.536.355 1.166.552 1.816.57.65-.018 1.28-.215 1.816-.57.54-.354.972-.852 1.246-1.438.602.223 1.264.27 1.894.14.629-.131 1.207-.445 1.67-.907.462-.463.776-1.04.907-1.67.13-.63.083-1.292-.14-1.893.586-.274 1.084-.705 1.438-1.246.355-.54.552-1.17.57-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.136 2.134 5.286-5.286 1.3 1.3-6.586 6.582z" />
    </g>
  </svg>
);

// X Logo Icon
const XLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current text-[#71767b] hover:text-white transition-colors">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function TweetTestimonial() {
  return (
    <div className="w-full relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 40px rgba(29, 155, 240, 0.4)' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-[#000000] border border-[#2f3336] rounded-2xl p-5 md:p-6 text-left cursor-pointer transition-colors duration-200 font-sans relative overflow-hidden group"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="David" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[16px] font-bold text-[#e7e9ea] truncate hover:underline">
                  David
                </span>
                <VerifiedBadge />
              </div>
              <span className="text-[14px] text-[#71767b] font-normal truncate">
                @david_builds
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold text-[#1d9bf0] bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d9bf0] animate-pulse" />
              Featured Post
            </span>
            <div className="p-1.5 rounded-full hover:bg-white/10 text-[#71767b] transition-colors">
              <XLogo />
            </div>
          </div>
        </div>

        {/* Tweet Body Text */}
        <p className="text-[17px] md:text-[18px] leading-[1.5] text-[#e7e9ea] font-normal mb-1 whitespace-pre-wrap tracking-normal">
          Holy shit the best thing I saw today, we can play Chess with our agent on{' '}
          <span className="text-[#1d9bf0] font-medium">@ChessWithClaw</span>
          . Like can&apos;t believe this. We are heading towards a new era of gaming with agents. ♟️🤖
        </p>
      </motion.div>
    </div>
  );
}
