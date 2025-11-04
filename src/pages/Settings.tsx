import { Form, Input, Button, Switch, Divider } from 'antd';
import styles from '../styles/Settings.module.css';

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Settings saved:', values);
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1>설정</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.settingsForm}
      >
        <Divider orientation="left">알림 설정</Divider>

        <Form.Item
          label="새 쪽지 알림"
          name="messageNotification"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="공지사항 알림"
          name="noticeNotification"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider orientation="left">개인정보</Divider>

        <Form.Item label="이름" name="name">
          <Input placeholder="이름을 입력하세요" />
        </Form.Item>

        <Form.Item label="이메일" name="email">
          <Input type="email" placeholder="이메일을 입력하세요" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            저장
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
