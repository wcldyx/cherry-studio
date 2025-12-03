import { DeleteIcon } from '@renderer/components/Icons'
import type { AssistantSettingCustomParameters } from '@renderer/types'
import { Button, Col, Input, InputNumber, Row, Select } from 'antd'
import { useTranslation } from 'react-i18next'

type CustomParametersListProps = {
  parameters: AssistantSettingCustomParameters[]
  onChange: (params: AssistantSettingCustomParameters[]) => void
  onDelete?: (params: AssistantSettingCustomParameters[], deletedIndex: number) => void
  style?: React.CSSProperties
}

const CustomParametersList = ({ parameters, onChange, onDelete, style }: CustomParametersListProps) => {
  const { t } = useTranslation()

  const updateParameters = (updater: (prev: AssistantSettingCustomParameters[]) => AssistantSettingCustomParameters[]) => {
    const next = updater(parameters)
    onChange(next)
    return next
  }

  const handleTypeChange = (index: number, type: AssistantSettingCustomParameters['type']) => {
    updateParameters((prev) => {
      const next = [...prev]
      let defaultValue: AssistantSettingCustomParameters['value'] = ''
      switch (type) {
        case 'number':
          defaultValue = 0
          break
        case 'boolean':
          defaultValue = false
          break
        case 'json':
          defaultValue = ''
          break
        default:
          defaultValue = ''
      }
      next[index] = {
        ...next[index],
        type,
        value: defaultValue
      }
      return next
    })
  }

  const handleFieldChange = (
    index: number,
    field: 'name' | 'value',
    value: string | number | boolean | object | null | undefined
  ) => {
    updateParameters((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        [field]: value ?? (field === 'value' ? '' : '')
      }
      return next
    })
  }

  const handleDelete = (index: number) => {
    const next = updateParameters((prev) => prev.filter((_, i) => i !== index))
    onDelete?.(next, index)
  }

  const renderValueInput = (param: AssistantSettingCustomParameters, index: number) => {
    switch (param.type) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={typeof param.value === 'number' ? param.value : 0}
            onChange={(value) => handleFieldChange(index, 'value', value ?? 0)}
            step={0.01}
          />
        )
      case 'boolean':
        return (
          <Select
            value={Boolean(param.value)}
            onChange={(value) => handleFieldChange(index, 'value', value)}
            style={{ width: '100%' }}
            options={[
              { label: 'true', value: true },
              { label: 'false', value: false }
            ]}
          />
        )
      case 'json': {
        const value = typeof param.value === 'string' ? param.value : JSON.stringify(param.value ?? '', null, 2)
        return (
          <Input
            value={value}
            placeholder='{"key":"value"}'
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
          />
        )
      }
      default:
        return (
          <Input
            value={typeof param.value === 'string' ? param.value : String(param.value ?? '')}
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
          />
        )
    }
  }

  if (parameters.length === 0) {
    return null
  }

  return (
    <div style={style}>
      {parameters.map((param, index) => (
        <Row key={`${param.name || 'param'}-${index}`} align="stretch" gutter={10} style={{ marginTop: 10 }}>
          <Col span={6}>
            <Input
              placeholder={t('models.parameter_name')}
              value={param.name}
              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select
              value={param.type}
              onChange={(value) => handleTypeChange(index, value)}
              style={{ width: '100%' }}>
              <Select.Option value="string">{t('models.parameter_type.string')}</Select.Option>
              <Select.Option value="number">{t('models.parameter_type.number')}</Select.Option>
              <Select.Option value="boolean">{t('models.parameter_type.boolean')}</Select.Option>
              <Select.Option value="json">{t('models.parameter_type.json')}</Select.Option>
            </Select>
          </Col>
          <Col span={10}>{renderValueInput(param, index)}</Col>
          <Col span={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              color="danger"
              variant="filled"
              icon={<DeleteIcon size={14} className="lucide-custom" />}
              onClick={() => handleDelete(index)}
            />
          </Col>
        </Row>
      ))}
    </div>
  )
}

export default CustomParametersList
