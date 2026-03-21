import { ChatPage } from '@/pages/chat'
import { ConfigProvider, theme } from 'antd'

export function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#a855f7',
        },
      }}
    >
      <ChatPage />
    </ConfigProvider>
  )
}
