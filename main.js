const yearNode = document.getElementById("current-year");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const fadeItems = document.querySelectorAll(".section-fade");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  fadeItems.forEach((item) => observer.observe(item));
} else {
  fadeItems.forEach((item) => item.classList.add("is-visible"));
}
