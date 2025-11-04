import { Table, Tag } from 'antd';
import styles from '../styles/Notice.module.css';

const Notice = () => {
  const columns = [
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <>
          {record.isImportant && <Tag color="red">중요</Tag>}
          {text}
        </>
      ),
    },
    {
      title: '작성자',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '작성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  return (
    <div className={styles.noticeContainer}>
      <div className={styles.header}>
        <h1>공지사항</h1>
      </div>

      <Table
        columns={columns}
        dataSource={[]}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Notice;
