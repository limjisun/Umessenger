import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  type?: 'checkbox' | 'toggle'; // 일반 체크박스 또는 토글 스위치
  disabled?: boolean;
  checkedIcon?: string; // 체크된 상태 이미지
  uncheckedIcon?: string; // 체크 안 된 상태 이미지
}

const Checkbox = ({
  checked,
  onChange,
  label,
  type = 'toggle',
  disabled = false,
  checkedIcon,
  uncheckedIcon
}: CheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  if (type === 'toggle') {
    return (
      <label className={`${styles.toggleLabel} ${disabled ? styles.disabled : ''}`}>
        {label && <span className={styles.labelText}>{label}</span>}
        <div className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className={styles.toggleInput}
          />
          <span className={styles.toggleSlider}></span>
        </div>
      </label>
    );
  }

  // 일반 체크박스 스타일
  // 이미지가 제공되면 이미지 사용, 아니면 CSS 스타일 사용
  if (checkedIcon && uncheckedIcon) {
    return (
      <label className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={styles.checkboxInput}
        />
        <img
          src={checked ? checkedIcon : uncheckedIcon}
          alt={checked ? 'checked' : 'unchecked'}
          className={styles.checkboxImage}
        />
        {label && <span className={styles.labelText}>{label}</span>}
      </label>
    );
  }

  return (
    <label className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.checkboxInput}
      />
      <span className={styles.checkboxCustom}></span>
      {label && <span className={styles.labelText}>{label}</span>}
    </label>
  );
};

export default Checkbox;
