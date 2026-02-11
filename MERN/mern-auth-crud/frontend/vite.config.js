import { defineConfig , loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: Number(env.VITE_PORT) || 5173
//   }
// })

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return defineConfig({
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || 5173,
      strictPort: true
    }
  })
}
