"use client";


type ShareButtonsProps = {
  url: string;
  title: string;
};

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  async function copyLink() {
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-lg transition hover:scale-110"
      >
        f
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black font-bold text-white shadow-lg transition hover:scale-110"
      >
        X
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 font-bold text-white shadow-lg transition hover:scale-110"
      >
        W
      </a>

      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-600 font-bold text-white shadow-lg transition hover:scale-110"
      >
        T
      </a>

      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 font-bold text-white shadow-lg transition hover:scale-110"
      >
        R
      </a>

      <button
        onClick={copyLink}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-neutral-900 font-bold text-white shadow-lg transition hover:scale-110"
      >
        ⧉
      </button>
    </div>
  );
}