import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "",
      redirect: "/index",
    },
    {
      path: "/index",
      name: "index",
      meta: { title: "index" },
      component: () => import("../views/index.vue"),
    },
    {
      path: "/index2",
      name: "index2",
      meta: { title: "index2" },
      component: () => import("../views/index2.vue"),
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
