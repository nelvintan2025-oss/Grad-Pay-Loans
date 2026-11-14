import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Forecast from './views/Forecast.vue'
import Loan from './views/Loan.vue'
import Compare from './views/Compare.vue'
import Method from './views/Method.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: 'Overview' } },
    { path: '/forecast', component: Forecast, meta: { title: 'Salary forecast' } },
    { path: '/loan', component: Loan, meta: { title: 'Loan sensitivity' } },
    { path: '/compare', component: Compare, meta: { title: 'Compare programmes' } },
    { path: '/method', component: Method, meta: { title: 'Method' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
router.afterEach((to) => {
  document.title = `${to.meta.title} · Grad Pay & Loans`
})

createApp(App).use(router).mount('#app')
