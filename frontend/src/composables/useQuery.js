import { useRoute } from 'vue-router'

export function useQuery() {
  const route = useRoute()
  return new URLSearchParams(route.query)
}

export default useQuery
