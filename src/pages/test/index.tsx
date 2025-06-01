import { View, Text, Button, ScrollView, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import * as API from '@/api'
import './index.less'

export default function TestPage() {
  // 状态管理
  const [loadingStates, setLoadingStates] = useState({
    login: false,
    currentUser: false,
    coaches: false,
    coachDetail: false,
    coachAvailability: false,
    memberships: false,
    membershipDetail: false,
    appointments: false,
    createAppointment: false,
    cancelAppointment: false,
    contracts: false
  })
  const [result, setResult] = useState<any>(null)
  const [user, setUser] = useState<API.User | null>(null)
  const [coaches, setCoaches] = useState<API.Coach[]>([])
  const [memberships, setMemberships] = useState<API.MembershipResponse[]>([])
  const [contracts, setContracts] = useState<API.MembershipContractResponse[]>([])
  const [appointments, setAppointments] = useState<API.AppointmentResponse[]>([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailTitle, setDetailTitle] = useState('')
  const [detailContent, setDetailContent] = useState<any>(null)
  const [timeSlots, setTimeSlots] = useState<API.TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<API.TimeSlot | null>(null)

  // 设置特定操作的加载状态
  const setLoadingState = (key: keyof typeof loadingStates, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }))
  }

  // 关闭详情模态框
  const closeDetailModal = () => {
    setDetailModalVisible(false)
  }

  // 显示详情模态框
  const showDetailModal = (title: string, content: any) => {
    setDetailTitle(title)
    setDetailContent(content)
    setDetailModalVisible(true)
  }

  useLoad(() => {
    console.log('Test page loaded')
    // 不再自动检查登录状态
  })


  // 获取当前用户信息
  const handleGetCurrentUser = async () => {
    try {
      setLoadingState('currentUser', true)
      const response = await API.getCurrentUser()
      setUser(response)
      setResult(response)
      return response
    } catch (error) {
      console.error('获取用户信息失败', error)
      setResult({ error: '获取用户信息失败', details: error })
      return null
    } finally {
      setLoadingState('currentUser', false)
    }
  }

  // 获取教练列表
  const handleGetCoaches = async () => {
    try {
      setLoadingState('coaches', true)
      const response = await API.getCoaches()
      setCoaches(response)
      setResult(response)
      return response
    } catch (error) {
      console.error('获取教练列表失败', error)
      setResult({ error: '获取教练列表失败', details: error })
      return []
    } finally {
      setLoadingState('coaches', false)
    }
  }

  // 获取教练详情
  const handleGetCoachDetail = async (coachId: number) => {
    try {
      setLoadingState('coachDetail', true)
      const response = await API.getCoachById(coachId)
      setResult(response)
      showDetailModal(`教练详情 #${coachId}`, response)
      return response
    } catch (error) {
      console.error('获取教练详情失败', error)
      setResult({ error: '获取教练详情失败', details: error })
      return null
    } finally {
      setLoadingState('coachDetail', false)
    }
  }

  // 获取教练可用时间
  const handleGetCoachAvailability = async (coachId: number) => {
    try {
      setLoadingState('coachAvailability', true)
      // 获取今天的日期
      const today = new Date().toISOString().split('T')[0]
      const response = await API.getCoachAvailability(coachId, today)
      setResult(response)
      setTimeSlots(response) // Store time slots for appointment creation
      showDetailModal(`教练可用时间 #${coachId}`, response)
      return response
    } catch (error) {
      console.error('获取教练可用时间失败', error)
      setResult({ error: '获取教练可用时间失败', details: error })
      setTimeSlots([]) // Clear time slots on error
      return null
    } finally {
      setLoadingState('coachAvailability', false)
    }
  }

  // 选择教练
  const handleSelectCoach = async (coachId: number) => {
    setSelectedCoach(coachId)
    setSelectedTimeSlot(null) // Reset selected time slot when coach changes
    // 自动获取教练可用时间
    await handleGetCoachAvailability(coachId)
  }

  // 获取我的会员卡
  const handleGetMyMemberships = async () => {
    try {
      setLoadingState('memberships', true)
      const response = await API.getMyMemberships()
      setMemberships(response)
      setResult(response)
      return response
    } catch (error) {
      console.error('获取会员卡失败', error)
      setResult({ error: '获取会员卡失败', details: error })
      return []
    } finally {
      setLoadingState('memberships', false)
    }
  }

  // 获取会员卡详情
  const handleGetMembershipDetail = async (membershipId: number) => {
    try {
      setLoadingState('membershipDetail', true)
      const response = await API.getMembershipById(membershipId)
      setResult(response)
      showDetailModal(`会员卡详情 #${membershipId}`, response)
      return response
    } catch (error) {
      console.error('获取会员卡详情失败', error)
      setResult({ error: '获取会员卡详情失败', details: error })
      return null
    } finally {
      setLoadingState('membershipDetail', false)
    }
  }

  // 获取我的预约列表
  const handleGetMyAppointments = async () => {
    try {
      setLoadingState('appointments', true)
      const response = await API.getMyAppointments()
      setAppointments(response)
      setResult(response)
      return response
    } catch (error) {
      console.error('获取预约列表失败', error)
      setResult({ error: '获取预约列表失败', details: error })
      return []
    } finally {
      setLoadingState('appointments', false)
    }
  }

  // 创建预约
  const handleCreateAppointment = async () => {
    if (!selectedCoach || !selectedMembership) {
      setResult({ error: '请先选择教练和会员卡' })
      Taro.showToast({
        title: '请先选择教练和会员卡',
        icon: 'none'
      })
      return
    }

    if (!selectedTimeSlot) {
      setResult({ error: '请先选择预约时间段' })
      Taro.showToast({
        title: '请先选择预约时间段',
        icon: 'none'
      })
      return
    }

    try {
      setLoadingState('createAppointment', true)

      const appointmentData: API.AppointmentCreate = {
        coach_id: selectedCoach,
        membership_id: selectedMembership,
        appointment_start: selectedTimeSlot.start,
      }

      const response = await API.createAppointment(appointmentData)
      setResult(response)

      Taro.showToast({
        title: '预约创建成功',
        icon: 'success'
      })

      // 重置选择的时间段
      setSelectedTimeSlot(null)

      // 刷新预约列表
      await handleGetMyAppointments()
    } catch (error) {
      console.error('创建预约失败', error)
      setResult({ error: '创建预约失败', details: error })
    } finally {
      setLoadingState('createAppointment', false)
    }
  }

  // 取消预约
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setLoadingState('cancelAppointment', true)
      const response = await API.cancelAppointment(appointmentId)
      setResult(response)

      Taro.showToast({
        title: '预约取消成功',
        icon: 'success'
      })

      // 刷新预约列表
      await handleGetMyAppointments()
    } catch (error) {
      console.error('取消预约失败', error)
      setResult({ error: '取消预约失败', details: error })
    } finally {
      setLoadingState('cancelAppointment', false)
    }
  }

  // 获取我的合同
  const handleGetMyContracts = async () => {
    try {
      setLoadingState('contracts', true)
      const response = await API.getMyContracts()
      setContracts(response)
      setResult(response)
      return response
    } catch (error) {
      console.error('获取合同失败', error)
      setResult({ error: '获取合同失败', details: error })
      return []
    } finally {
      setLoadingState('contracts', false)
    }
  }

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 渲染详情内容
  const renderDetailContent = () => {
    if (!detailContent) return <Text className='no-data'>暂无详情数据</Text>

    // 根据标题判断是什么类型的详情
    if (detailTitle.includes('会员卡详情')) {
      const membership = detailContent as API.MembershipResponse
      return (
        <View className='detail-content'>
          <View className='detail-item'>
            <Text className='detail-label'>ID:</Text>
            <Text className='detail-value'>{membership.id}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>会员ID:</Text>
            <Text className='detail-value'>{membership.uid}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>类型ID:</Text>
            <Text className='detail-value'>{membership.type_id}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>剩余次数:</Text>
            <Text className='detail-value'>{membership.remaining_sessions}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>购买日期:</Text>
            <Text className='detail-value'>{new Date(membership.purchased_at).toLocaleString()}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>过期日期:</Text>
            <Text className='detail-value'>{new Date(membership.expired_at).toLocaleString()}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>状态:</Text>
            <Text className={`detail-value status-${membership.status}`}>{membership.status}</Text>
          </View>
        </View>
      )
    } else if (detailTitle.includes('教练详情')) {
      const coach = detailContent as API.Coach
      return (
        <View className='detail-content'>
          <View className='detail-item'>
            <Text className='detail-label'>ID:</Text>
            <Text className='detail-value'>{coach.id}</Text>
          </View>
          <View className='detail-item'>
            <Text className='detail-label'>姓名:</Text>
            <Text className='detail-value'>{coach.name}</Text>
          </View>
          {coach.specialty && (
            <View className='detail-item'>
              <Text className='detail-label'>简介:</Text>
              <Text className='detail-value'>{coach.specialty}</Text>
            </View>
          )}
          {coach.specialty && (
            <View className='detail-item'>
              <Text className='detail-label'>专长:</Text>
              <Text className='detail-value'>{coach.specialty}</Text>
            </View>
          )}
          {coach.avatar_url && (
            <View className='detail-item'>
              <Text className='detail-label'>头像:</Text>
              <View className='detail-value'>
                <Image src={coach.avatar_url} className='coach-avatar' mode='aspectFill' />
              </View>
            </View>
          )}
        </View>
      )
    } else if (detailTitle.includes('教练可用时间')) {
      const timeSlotDetails = detailContent as API.TimeSlot[]
      return (
        <View className='detail-content'>
          {timeSlotDetails && timeSlotDetails.length > 0 ? (
            <View className='time-slots-list'>
              {timeSlotDetails.map((slot, index) => (
                <View key={index} className='time-slot-item'>
                  <Text className='time-slot-time'>
                    {new Date(slot.start).toLocaleTimeString()} - {new Date(slot.end).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className='no-data'>当天没有可用时间</Text>
          )}
        </View>
      )
    } else {
      // 默认显示JSON
      return <Text className='detail-json'>{JSON.stringify(detailContent, null, 2)}</Text>
    }
  }

  // 显示结果
  const renderResult = () => {
    if (!result) return <Text>暂无数据</Text>
    return <Text className='result-json'>{JSON.stringify(result, null, 2)}</Text>
  }

  return (
    <View className='test-container'>
      <View className='header'>
        <Text className='title'>API 测试页面</Text>
        {user && (
          <View className='user-info'>
            <Text className='welcome'>欢迎, {user.name || '用户'}</Text>
          </View>
        )}
      </View>

      <ScrollView className='test-buttons' scrollY>
        <View className='section'>
          <Text className='section-title'>用户</Text>
          <Button onClick={handleGetCurrentUser} loading={loadingStates.currentUser} className='test-button'>
            获取用户信息
          </Button>
        </View>

        <View className='section'>
          <Text className='section-title'>教练管理</Text>
          <Button onClick={handleGetCoaches} loading={loadingStates.coaches} className='test-button'>
            获取教练列表
          </Button>

          {coaches.length > 0 && (
            <View>
              <Text className='sub-title'>教练列表 (点击选择预约教练 {selectedCoach ? `- 已选择教练ID: ${selectedCoach}` : ''})</Text>
              <ScrollView scrollX className='coach-list'>
                {coaches.map(coach => (
                  <View
                    key={coach.id}
                    className={`coach-item ${selectedCoach === coach.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCoach(coach.id)}
                  >
                    <Text className='coach-name'>{coach.name}</Text>
                    {selectedCoach === coach.id && (
                      <View className='selected-badge'>已选</View>
                    )}
                    <View className='coach-actions'>
                      <Button
                        size='mini'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGetCoachDetail(coach.id)
                        }}
                      >
                        详情
                      </Button>
                      <Button
                        size='mini'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGetCoachAvailability(coach.id)
                        }}
                      >
                        可用时间
                      </Button>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View className='section'>
          <Text className='section-title'>会员卡</Text>
          <Button onClick={handleGetMyMemberships} loading={loadingStates.memberships} className='test-button'>
            获取我的会员卡
          </Button>

          {memberships.length > 0 && (
            <View className='membership-section'>
              <Text className='sub-title'>会员卡列表 (点击选择用于预约的会员卡 {selectedMembership ? `- 已选择会员卡ID: ${selectedMembership}` : ''})</Text>
              <ScrollView scrollY className='membership-list-vertical'>
                {memberships.map(membership => (
                  <View
                    key={membership.id}
                    className={`membership-item-vertical ${selectedMembership === membership.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMembership(membership.id)}
                  >
                    <View className='membership-header'>
                      <Text className='membership-title'>会员卡 #{membership.id}</Text>
                      {selectedMembership === membership.id && (
                        <View className='selected-badge'>已选</View>
                      )}
                      <Button
                        size='mini'
                        className='detail-button'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGetMembershipDetail(membership.id)
                        }}
                      >
                        详情
                      </Button>
                    </View>
                    <View className='membership-content'>
                      <View className='membership-info-item'>
                        <Text className='info-label'>会员ID:</Text>
                        <Text className='info-value'>{membership.uid}</Text>
                      </View>
                      <View className='membership-info-item'>
                        <Text className='info-label'>类型ID:</Text>
                        <Text className='info-value'>{membership.type_id}</Text>
                      </View>
                      <View className='membership-info-item'>
                        <Text className='info-label'>剩余次数:</Text>
                        <Text className='info-value'>{membership.remaining_sessions}</Text>
                      </View>
                      <View className='membership-info-item'>
                        <Text className='info-label'>购买日期:</Text>
                        <Text className='info-value'>{new Date(membership.purchased_at).toLocaleDateString()}</Text>
                      </View>
                      <View className='membership-info-item'>
                        <Text className='info-label'>过期日期:</Text>
                        <Text className='info-value'>{new Date(membership.expired_at).toLocaleDateString()}</Text>
                      </View>
                      <View className='membership-info-item'>
                        <Text className='info-label'>状态:</Text>
                        <Text className={`info-value status-${membership.status}`}>{membership.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View className='section'>
          <Text className='section-title'>预约</Text>
          <View className='create-appointment-section'>
            <View className='selection-status'>
              <Text className='sub-title'>创建预约需要选择:</Text>
              <View className='selection-item'>
                <Text className='selection-label'>教练:</Text>
                <Text className={`selection-value ${selectedCoach ? 'selected-value' : 'missing-value'}`}>
                  {selectedCoach ? `已选择 ID: ${selectedCoach}` : '未选择 (请在教练管理中点击教练卡片)'}
                </Text>
              </View>
              <View className='selection-item'>
                <Text className='selection-label'>会员卡:</Text>
                <Text className={`selection-value ${selectedMembership ? 'selected-value' : 'missing-value'}`}>
                  {selectedMembership ? `已选择 ID: ${selectedMembership}` : '未选择 (请在会员卡中点击卡片)'}
                </Text>
              </View>
              <View className='selection-item'>
                <Text className='selection-label'>时间段:</Text>
                <Text className={`selection-value ${selectedTimeSlot ? 'selected-value' : 'missing-value'}`}>
                  {selectedTimeSlot
                    ? `已选择: ${new Date(selectedTimeSlot.start).toLocaleTimeString()} - ${new Date(selectedTimeSlot.end).toLocaleTimeString()}`
                    : '未选择 (请点击下方时间段或获取教练可用时间)'}
                </Text>
              </View>
            </View>

            {/* 可用时间段选择 */}
            {selectedCoach && timeSlots.length > 0 && (
              <View className='time-slots-selection'>
                <Text className='sub-title'>请选择时间段:</Text>
                <ScrollView scrollY className='time-slots-scroll'>
                  {timeSlots.map((slot, index) => (
                    <View
                      key={index}
                      className={`time-slot-selectable ${selectedTimeSlot && selectedTimeSlot.start === slot.start ? 'selected' : ''}`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      <Text className='time-slot-text'>
                        {new Date(slot.start).toLocaleTimeString()} - {new Date(slot.end).toLocaleTimeString()}
                      </Text>
                      {selectedTimeSlot && selectedTimeSlot.start === slot.start && (
                        <View className='selected-badge time-selected'>已选</View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedCoach && timeSlots.length === 0 && (
              <View className='no-time-slots'>
                <Text className='warning-text'>教练当天没有可用时间，请点击教练卡片上的&quot;可用时间&quot;按钮查看</Text>
              </View>
            )}

            <View className='action-row'>
              <Button
                onClick={handleCreateAppointment}
                loading={loadingStates.createAppointment}
                className={`test-button ${(!selectedCoach || !selectedMembership || !selectedTimeSlot) ? 'disabled-button' : ''}`}
                disabled={!selectedCoach || !selectedMembership || !selectedTimeSlot}
              >
                创建预约
              </Button>
              <Button onClick={handleGetMyAppointments} loading={loadingStates.appointments} className='test-button'>
                刷新预约列表
              </Button>
            </View>
          </View>

          {appointments.length > 0 ? (
            <View className='appointments-list'>
              {appointments.map(appointment => (
                <View key={appointment.id} className='appointment-item'>
                  <View className='appointment-info'>
                    <Text className='appointment-time'>
                      {formatDateTime(appointment.appointment_start)} - {formatDateTime(appointment.appointment_end)}
                    </Text>
                    <Text className='appointment-coach'>教练: {appointment.coach.name}</Text>
                    <Text className='appointment-status'>状态: {appointment.status}</Text>
                  </View>
                  {appointment.status === 'scheduled' && (
                    <Button
                      size='mini'
                      className='cancel-button'
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      取消预约
                    </Button>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className='no-data'>暂无预约</Text>
          )}
        </View>

        <View className='section'>
          <Text className='section-title'>合同</Text>
          <Button onClick={handleGetMyContracts} loading={loadingStates.contracts} className='test-button'>
            获取我的合同
          </Button>

          {contracts.length > 0 && (
            <ScrollView scrollX className='contract-list'>
              {contracts.map(contract => (
                <View key={contract.id} className='contract-item'>
                  <Text>合同号: {contract.contract_number}</Text>
                  <Text>签约日期: {contract.signing_date}</Text>
                  <Text>金额: {contract.total_amount}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <View className='result-container'>
        <Text className='section-title'>响应结果</Text>
        <ScrollView scrollY className='result-scroll'>
          {renderResult()}
        </ScrollView>
      </View>

      {/* 详情模态框 */}
      {detailModalVisible && (
        <View className='detail-modal-overlay' onClick={closeDetailModal}>
          <View className='detail-modal' onClick={e => e.stopPropagation()}>
            <View className='detail-modal-header'>
              <Text className='detail-modal-title'>{detailTitle}</Text>
              <Text className='detail-modal-close' onClick={closeDetailModal}>×</Text>
            </View>
            <ScrollView scrollY className='detail-modal-body'>
              {renderDetailContent()}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
} 