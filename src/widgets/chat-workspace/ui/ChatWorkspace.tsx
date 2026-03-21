import { DeleteOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Layout,
  List,
  Segmented,
  theme,
  Typography,
} from 'antd'
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  AGENT_BY_ID,
  AGENT_PRESETS,
  selectActiveChat,
  useChatWorkspaceStore,
  type AgentId,
} from '@/entities/chat'
import { useSendChatMessage } from '@/features/send-chat-message'

const { Sider, Content } = Layout

export function ChatWorkspace() {
  const { token } = theme.useToken()
  const chats = useChatWorkspaceStore((s) => s.chats)
  const activeChatId = useChatWorkspaceStore((s) => s.activeChatId)
  const isSending = useChatWorkspaceStore((s) => s.isSending)
  const sendError = useChatWorkspaceStore((s) => s.sendError)
  const createChat = useChatWorkspaceStore((s) => s.createChat)
  const deleteChat = useChatWorkspaceStore((s) => s.deleteChat)
  const selectChat = useChatWorkspaceStore((s) => s.selectChat)
  const setAgent = useChatWorkspaceStore((s) => s.setAgent)
  const setSendError = useChatWorkspaceStore((s) => s.setSendError)

  const activeChat = useChatWorkspaceStore(selectActiveChat)
  const { send } = useSendChatMessage()

  const [draft, setDraft] = useState('')
  const transcriptRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = transcriptRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  const submit = useCallback(() => {
    const text = draft.trim()
    if (!text || isSending) return
    setDraft('')
    void send(text, scrollToBottom)
  }, [draft, isSending, send, scrollToBottom])

  const onKeyDown = (ev: KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault()
      submit()
    }
  }

  if (!activeChat) return null

  return (
    <Layout
      style={{
        minHeight: '100vh',
        maxWidth: 1280,
        margin: '0 auto',
        background: token.colorBgLayout,
      }}
    >
      <Sider
        width={280}
        theme="light"
        style={{
          borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
        }}
      >
        <Flex
          vertical
          gap="middle"
          style={{
            padding: token.padding,
            height: '100%',
            minHeight: 0,
          }}
        >
          <div>
            <Typography.Title level={5} style={{ margin: '0 0 8px' }}>
              AI workspace
            </Typography.Title>
            <Button type="primary" block onClick={createChat}>
              New chat
            </Button>
          </div>
          <List
            style={{ flex: 1, overflow: 'auto', minHeight: 0 }}
            dataSource={chats}
            renderItem={(c) => {
              const agent = AGENT_BY_ID[c.agentId]
              const isActive = c.id === activeChatId
              return (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: isActive
                      ? token.colorPrimaryBg
                      : undefined,
                    borderRadius: token.borderRadiusLG,
                    marginBottom: token.marginXXS,
                    padding: `${token.paddingSM}px ${token.padding}px`,
                    border: `1px solid ${isActive ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                  }}
                  onClick={() => selectChat(c.id)}
                  actions={[
                    <Button
                      key="del"
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      aria-label="Delete chat"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(c.id)
                      }}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Typography.Text ellipsis>
                        {c.title}
                      </Typography.Text>
                    }
                    description={`${agent.shortLabel} · ${c.messages.length} messages`}
                  />
                </List.Item>
              )
            }}
          />
        </Flex>
      </Sider>

      <Layout style={{ background: token.colorBgLayout }}>
        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: 0,
          }}
        >
          <Flex
            vertical
            gap="small"
            style={{
              padding: token.padding,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {activeChat.title}
              </Typography.Title>
              <Typography.Text type="secondary">
                {AGENT_BY_ID[activeChat.agentId].description}
              </Typography.Text>
            </div>
            <Segmented<AgentId>
              aria-label="Agent mode"
              value={activeChat.agentId}
              disabled={isSending}
              onChange={(value) => setAgent(activeChat.id, value)}
              options={AGENT_PRESETS.map((p) => ({
                label: p.shortLabel,
                value: p.id,
              }))}
            />
          </Flex>

          <Flex
            vertical
            gap="middle"
            ref={transcriptRef}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: token.padding,
            }}
          >
            {activeChat.messages.length === 0 ? (
              <Empty
                style={{ margin: 'auto' }}
                description={
                  <Typography.Paragraph style={{ margin: 0 }}>
                    <Typography.Text strong>
                      {AGENT_BY_ID[activeChat.agentId].label}
                    </Typography.Text>{' '}
                    — pick a mode above if needed and send a message. Each
                    chat keeps its own history; the system prompt follows
                    the selected mode.
                  </Typography.Paragraph>
                }
              />
            ) : (
              activeChat.messages.map((m) => (
                <Flex
                  key={m.id}
                  justify={m.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Card
                    size="small"
                    style={{
                      maxWidth: 720,
                      width: '100%',
                      background:
                        m.role === 'user'
                          ? token.colorPrimaryBg
                          : token.colorFillAlter,
                      borderColor:
                        m.role === 'user'
                          ? token.colorPrimaryBorder
                          : token.colorBorderSecondary,
                    }}
                    styles={{
                      body: { padding: `${token.paddingSM}px ${token.padding}px` },
                    }}
                  >
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: token.fontSizeSM,
                        display: 'block',
                        marginBottom: token.marginXXS,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {m.role === 'user' ? 'You' : 'Assistant'}
                    </Typography.Text>
                    <Typography.Paragraph
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.content}
                    </Typography.Paragraph>
                  </Card>
                </Flex>
              ))
            )}
          </Flex>

          <Flex
            vertical
            gap="small"
            style={{
              padding: token.padding,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            {sendError ? (
              <Alert
                type="error"
                showIcon
                message={sendError}
                closable
                onClose={() => setSendError(null)}
              />
            ) : null}
            <Flex gap="small" align="flex-end">
              <Input.TextArea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message… (Enter to send, Shift+Enter for new line)"
                disabled={isSending}
                autoSize={{ minRows: 3, maxRows: 8 }}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                loading={isSending}
                disabled={!draft.trim()}
                onClick={submit}
              >
                Send
              </Button>
            </Flex>
          </Flex>
        </Content>
      </Layout>
    </Layout>
  )
}
