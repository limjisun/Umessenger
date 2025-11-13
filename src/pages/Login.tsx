import { useEffect } from 'react';
import { Button, Input, Form } from 'antd';
import { Checkbox } from '../components/common';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types';
import styles from '../styles/Login.module.css';
import logo from '../assets/images/m_logo.png';

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const [form] = Form.useForm();

  // 저장된 아이디 불러오기
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      form.setFieldsValue({ username: savedUsername, remember: true });
    }
  }, [form]);

  const onSubmit = (values: LoginCredentials & { remember?: boolean }) => {
    // 기억하기 체크되어 있으면 localStorage에 저장
    if (values.remember) {
      localStorage.setItem('rememberedUsername', values.username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    const mockUser = {
      id: '1',
      username: values.username,
      email: `${values.username}@example.com`,
      name: values.username,
      status: 'online' as const,
    };

    login(mockUser);

    // 새 팝업 창으로 메신저 열기 (1000px × 500px)
    const baseUrl = import.meta.env.BASE_URL || '/';
    window.open(
      `${baseUrl}messages`,
      'messenger',
      'width=900,height=630,left=100,top=100,resizable=yes,scrollbars=yes'
    );
  };

  return (
    <div className={styles.loginContainer}>
      
      <div className={styles.loginlogo}>
        <img
            src={logo}
            alt="umessenger"
          />
      </div>
      <div className={styles.loginBoxWrap}>
        <div className={styles.loginBox}>
          <Form form={form} onFinish={onSubmit} className={styles.loginForm}>
            <div className={styles.loginInput}>
              <Form.Item
                name="username"
              >
                <Input
                  placeholder="아이디를 입력하세요"
                />
              </Form.Item>

              <Form.Item
                name="password"
              >
                <Input.Password
                  placeholder="비밀번호를 입력하세요"
                />
              </Form.Item>

              <Form.Item
                name="remember"
                valuePropName="checked"
                className={styles.rememberItem}
              >
                <Checkbox
                  checked={form.getFieldValue('remember') || false}
                  onChange={(checked) => form.setFieldValue('remember', checked)}
                  label="기억하기"
                  type="checkbox"
                />
              </Form.Item>
           </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block>
                로그인
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <p className={styles.loginfooter}>© 2025 NEXUS COMMUNITY All rights reserved.</p>
    </div>
  );
};

export default Login;
