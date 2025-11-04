import { Button, Input, Form } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types';
import styles from '../styles/Login.module.css';

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const [form] = Form.useForm();

  const onSubmit = (values: LoginCredentials) => {
    const mockUser = {
      id: '1',
      username: values.username,
      email: `${values.username}@example.com`,
      name: values.username,
    };

    login(mockUser);

    // 새 팝업 창으로 메신저 열기 (1000px × 500px)
    window.open(
      '/messages',
      'messenger',
      'width=1000,height=500,left=100,top=100,resizable=yes,scrollbars=yes'
    );
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1>메신저 로그인</h1>
          <p>계정 정보를 입력해주세요</p>
        </div>

        <Form form={form} onFinish={onSubmit} className={styles.loginForm}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '아이디를 입력해주세요' }]}
          >
            <Input
              size="large"
              placeholder="아이디"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
          >
            <Input.Password
              size="large"
              placeholder="비밀번호"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              로그인
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
