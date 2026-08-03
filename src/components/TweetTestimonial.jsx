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
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w 5 h-5 fill-current text-[#71767b] hover:text-white transition-colors">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function TweetTestimonial() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(4821);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(384);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(920);
  const [showToast, setShowToast] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleRepost = (e) => {
    e.stopPropagation();
    if (reposted) {
      setReposted(false);
      setRepostCount((prev) => prev - 1);
    } else {
      setReposted(true);
      setRepostCount((prev) => prev + 1);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (bookmarked) {
      setBookmarked(false);
      setBookmarkCount((prev) => prev - 1);
    } else {
      setBookmarked(true);
      setBookmarkCount((prev) => prev + 1);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('https://x.com/0xalyt');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCardClick = () => {
    window.open('https://x.com/0xalyt', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full relative">
      <motion.div
        onClick={handleCardClick}
        whileHover={{ scale: 1.012, y: -2 }}
        whileTap={{ scale: 0.992 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-[#000000] border border-[#2f3336] hover:border-[#1d9bf0]/40 rounded-2xl p-5 md:p-6 text-left cursor-pointer transition-colors duration-200 shadow-xl hover:shadow-[0_12px_36px_-8px_rgba(29,155,240,0.15),0_0_0_1px_rgba(29,155,240,0.2)] font-sans relative overflow-hidden group"
      >
        {/* Subtle accent glow on hover */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1d9bf0]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#1d9bf0]/20 transition-all duration-500" />

        {/* Top bar: Author Info & X logo */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Jake Reynolds"
              className="w-11 h-11 rounded-full object-cover border border-white/10 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-bold text-[15px] text-[#e7e9ea] truncate hover:underline">
                  Jake Reynolds
                </span>
                <VerifiedBadge />
              </div>
              <span className="text-[14px] text-[#71767b] font-normal truncate">
                @jake_tech
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
        <p className="text-[17px] md:text-[18px] leading-[1.5] text-[#e7e9ea] font-normal mb-4 whitespace-pre-wrap tracking-normal">
          Holy shit the best thing I saw today, we can play Chess with our agent on{' '}
          <span
            onClick={(e) => {
              e.stopPropagation();
              window.open('https://x.com/0xalyt', '_blank', 'noopener,noreferrer');
            }}
            className="text-[#1d9bf0] hover:underline font-medium cursor-pointer"
          >
            @ChessWithClaw
          </span>
          . Like can&apos;t believe this. We are heading towards a new era of gaming with agents. ♟️🤖
        </p>

        {/* Timestamp & Views */}
        <div className="flex items-center gap-1.5 text-[14px] text-[#71767b] py-3 border-y border-[#2f3336]/80 my-3 font-normal">
          <span>9:41 AM</span>
          <span>·</span>
          <span>Oct 24, 2024</span>
          <span>·</span>
          <span className="text-[#e7e9ea] font-semibold">248.5K</span>
          <span>Views</span>
        </div>

        {/* Action / Engagement Bar */}
        <div className="flex items-center justify-between text-[#71767b] pt-1 text-[13px] font-medium">
          {/* Reply */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex items-center gap-2 group/btn hover:text-[#1d9bf0] transition-colors py-1.5 px-2.5 -ml-2.5 rounded-full hover:bg-[#1d9bf0]/10"
            title="Reply"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current group-hover/btn:text-[#1d9bf0]">
              <g>
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.59-4 7.01v2.11c0 .82-.88 1.34-1.61.95l-3.72-1.96h-3.165c-4.42 0-8.005-3.58-8.005-8zm8.005-6c-3.317 0-6.005 2.69-6.005 6s2.688 6 6.005 6h3.69l.34.18 2.22 1.17v-1.12l.14-.08c1.83-1.07 2.94-3.07 2.94-5.22 0-3.38-2.75-6.13-6.13-6.13H9.756z" />
              </g>
            </svg>
            <span>142</span>
          </button>

          {/* Repost */}
          <button
            onClick={handleRepost}
            className={`flex items-center gap-2 group/btn transition-colors py-1.5 px-2.5 rounded-full hover:bg-[#00ba7c]/10 ${
              reposted ? 'text-[#00ba7c]' : 'hover:text-[#00ba7c]'
            }`}
            title="Repost"
          >
            <motion.svg
              animate={reposted ? { rotate: 180, scale: [1, 1.25, 1] } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-4 h-4 fill-current"
            >
              <g>
                <path d="M4.5 3.88l4.42 4.42-1.42 1.42L5.5 7.72V15c0 1.38 1.12 2.5 2.5 2.5h8v2H8c-2.48 0-4.5-2.02-4.5-4.5V7.72L1.5 9.72.08 8.3 4.5 3.88zM16 4.5h-8v-2h8c2.48 0 4.5 2.02 4.5 4.5v7.28l2-2 1.42 1.42-4.42 4.42-4.42-4.42 1.42-1.42 2 2V7c0-1.38-1.12-2.5-2.5-2.5z" />
              </g>
            </motion.svg>
            <span>{repostCount.toLocaleString()}</span>
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 group/btn transition-colors py-1.5 px-2.5 rounded-full hover:bg-[#f91880]/10 ${
              liked ? 'text-[#f91880]' : 'hover:text-[#f91880]'
            }`}
            title="Like"
          >
            <motion.svg
              animate={liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-4 h-4 fill-current"
            >
              {liked ? (
                <path d="M20.884 13.19c-1.351 3.16-4.301 5.86-8.884 10.07-4.583-4.21-7.533-6.91-8.884-10.07C1.76 10.01 2.86 6.3 5.922 4.67c2.37-1.26 5.19-.66 6.942 1.28 1.75-1.94 4.57-2.54 6.942-1.28 3.062 1.63 4.162 5.34 3.08 8.52z" />
              ) : (
                <path d="M16.697 5.5c-1.222-.06-2.436.32-3.376 1.07-.811.65-1.388 1.54-1.621 2.53-.233-.99-.81-1.88-1.621-2.53-.94-.75-2.154-1.13-3.376-1.07-2.333.12-4.329 1.68-4.996 3.91-.7 2.34.02 4.88 1.812 6.55 2.122 1.98 4.793 4.18 7.181 6.16 2.388-1.98 5.059-4.18 7.181-6.16 1.792-1.67 2.512-4.21 1.812-6.55-.667-2.23-2.663-3.79-4.996-3.91zM12 21.35l-.83-.77C6.01 15.65 2.5 12.47 2.5 8.5 2.5 5.42 4.92 3 8 3c1.74 0 3.41.81 4.5 2.09C13.59 3.81 15.26 3 17 3c3.08 0 5.5 2.42 5.5 5.5 0 3.97-3.51 7.15-8.67 12.09l-.83.76z" />
              )}
            </motion.svg>
            <span>{likeCount.toLocaleString()}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 group/btn transition-colors py-1.5 px-2.5 rounded-full hover:bg-[#1d9bf0]/10 ${
              bookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'
            }`}
            title="Bookmark"
          >
            <motion.svg
              animate={bookmarked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-4 h-4 fill-current"
            >
              {bookmarked ? (
                <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v16.86l-8-4.57-8 4.57V4.5z" />
              ) : (
                <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v16.86l-8-4.57-8 4.57V4.5zm2.5-.5c-.276 0-.5.224-.5.5v14.14l6-3.43 6 3.43V4.5c0-.276-.224-.5-.5-.5h-11z" />
              )}
            </motion.svg>
            <span>{bookmarkCount.toLocaleString()}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 group/btn hover:text-[#1d9bf0] transition-colors py-1.5 px-2.5 -mr-2.5 rounded-full hover:bg-[#1d9bf0]/10"
            title="Share post"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current group-hover/btn:text-[#1d9bf0]">
              <g>
                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L7.71 9.71 6.3 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
              </g>
            </svg>
          </button>
        </div>

        {/* Toast Notification when link copied */}
        {showToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1d9bf0] text-white text-[12px] font-semibold px-3 py-1.5 rounded-full shadow-lg pointer-events-none animate-fade-in">
            Link copied to clipboard!
          </div>
        )}
      </motion.div>
    </div>
  );
}
