import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OperatorView from '../views/OperatorView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/operator', component: OperatorView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
