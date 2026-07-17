export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Allow access to login and OAuth callback pages
  if (to.path === '/login' || to.path === '/confirm') return

  // If OAuth code arrives at the wrong path (e.g. root), redirect to /confirm
  if (to.query.code && to.path !== '/confirm') {
    return navigateTo({ path: '/confirm', query: { code: to.query.code } })
  }

  // If there's an OAuth callback hash in the URL, let Supabase process it first
  // This avoids a false "no session" redirect right after Google OAuth
  if (import.meta.client && window.location.hash.includes('access_token')) {
    return
  }

  // Check session if user reactive ref is not yet populated
  if (!user.value) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return navigateTo('/login')
    }
  }
})
