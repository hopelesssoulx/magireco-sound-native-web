import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "",
      redirect: "/index3",
    },
    {
      path: "/index",
      name: "index",
      meta: { title: "" },
      component: () => import("../views/index.vue"),
    },
    {
      path: "/index2",
      name: "index2",
      meta: { title: "" },
      component: () => import("../views/index2.vue"),
    },
    {
      path: "/index3",
      name: "index3",
      meta: { title: "" },
      component: () => import("../views/index3.vue"),
    },
    {
      path: "/movie",
      name: "movie",
      meta: { title: "" },
      component: () => import("../views/movie.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.title != null) {
    // document.title = to.meta.title;
    document.title = "\u200E";
  }
  next();
});

export default router;
