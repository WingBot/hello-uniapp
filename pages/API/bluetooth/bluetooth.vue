<template>
	<view>
		<page-head :title="title"></page-head>
		<view class="uni-padding-wrap uni-common-mt">
			<view>
				本蓝牙协议只支持低功耗蓝牙协议ble。如果想连接非ble蓝牙设备，请在社区搜索 Native.js 蓝牙。
			</view>
			<view class="uni-btn-v">
				<button type="primary" :disabled="disabled[0]" @click="openBluetoothAdapter">
					初始化蓝牙模块
				</button>
				<view v-if="!adapterState.available">
					{{ '蓝牙适配器不可用,请初始化蓝牙模块' }}
				</view>
				<button
					type="primary"
					:loading="searchLoad"
					:disabled="disabled[1]"
					@click="startBluetoothDevicesDiscovery"
				>
					开始搜索蓝牙设备
				</button>
				<button
					type="primary"
					:disabled="disabled[2]"
					@click="stopBluetoothDevicesDiscovery(false)"
				>
					停止搜索蓝牙设备
				</button>
				<button
					type="primary"
					:loading="newDeviceLoad"
					:disabled="disabled[3]"
					@click="queryDevices"
				>
					选择设备
				</button>
				<view v-if="equipment.length > 0" class="device-info-card">
					<view class="device-title">
						{{ (connected ? '已连接设备' : '已选择设备') }}
					</view>
					<view class="device-details">
						<view class="device-name">
							<text class="label">设备名称:</text>
							<text class="value">{{ equipment[0].name || equipment[0].localName || '未知设备' }}</text>
						</view>
						<view class="device-id">
							<text class="label">设备ID:</text>
							<text class="value">{{ equipment[0].deviceId }}</text>
						</view>
						<view class="device-rssi">
							<text class="label">信号强度:</text>
							<text class="value">{{ equipment[0].RSSI }}dBm</text>
						</view>
						<view class="device-services" v-if="equipment[0].advertisServiceUUIDs">
							<text class="label">广播服务:</text>
							<text class="value">{{ equipment[0].advertisServiceUUIDs.length }}个</text>
						</view>
					</view>
				</view>
				<button type="primary" :disabled="disabled[4]" @click="createBLEConnection">
					连接蓝牙设备
				</button>
				<button type="primary" :disabled="disabled[5]" @click="getBLEDeviceServices">
					选择设备服务
				</button>
				<view v-if="servicesData.length > 0">已选服务uuid：{{ servicesData[0].uuid }}</view>
				<button type="primary" :disabled="disabled[6]" @click="getBLEDeviceCharacteristics">
					获取服务的特征值
				</button>
				<view v-if="characteristicsData.length > 0">
					<view class="uni-list_name">uuid:{{ characteristicsData[0].uuid }}</view>
					<view class="uni-list_item">
						是否支持 read 操作:{{ characteristicsData[0].properties.read }}
					</view>
					<view class="uni-list_item">
						是否支持 write 操作:{{ characteristicsData[0].properties.write }}
					</view>
					<view class="uni-list_item">
						是否支持 notify 操作:{{ characteristicsData[0].properties.notify }}
					</view>
					<view class="uni-list_item">
						是否支持 indicate 操作:{{ characteristicsData[0].properties.indicate }}
					</view>
				</view>
				<!-- <button type="primary" :disabled="disabled[7]" @click="readBLECharacteristicValue">
					读取特征值数据
				</button>
				<view v-if="valueChangeData.serviceId">
					<view class="list-name">
						特征值最新的值:{{ valueChangeData.value || '还没有最新值' }}
					</view>
				</view> -->
				<!-- <button type="primary" :disabled="disabled[8]" @click="w">写入特征值数据</button> -->
				<button type="primary" :disabled="disabled[9]" @click="closeBLEConnection">
					断开蓝牙设备
				</button>
				<button type="primary" :disabled="disabled[10]" @click="closeBluetoothAdapter">
					关闭蓝牙模块
				</button>
			</view>
		</view>
		<!-- 遮罩 -->
		<view v-if="maskShow" class="uni-mask" @touchmove.stop.prevent="moveHandle" @click="maskclose">
			<scroll-view class="uni-scroll_box" scroll-y @touchmove.stop.prevent="moveHandle" @click.stop="moveHandle">
				<view class="uni-title">
					<view v-if="showMaskType === 'device'">
						<view class="search-status">
							<text v-if="searchLoad" class="searching">🔍 正在搜索设备...</text>
							<text v-else>已发现 {{ list.length }} 台设备</text>
						</view>
						<view v-if="list.length > 0" class="search-tip">
							点击设备进行连接
						</view>
					</view>
					<view v-else>
						已发现{{ list.length }}{{ showMaskType === 'service' ? '个服务' : '个特征值' }}:
					</view>
				</view>
				<view
					class="uni-list-box device-item"
					v-for="(item, index) in list"
					:key="index"
					@click="tapQuery(item)"
				>
					<view v-if="showMaskType === 'device'" class="device-item-content">
						<view class="device-header">
							<view class="device-name">{{ item.name || item.localName || '未知设备' }}</view>
							<view class="device-status">
								<view class="device-rssi" :class="getRSSIClass(item.RSSI)">
									{{ item.RSSI }}dBm
								</view>
								<view v-if="equipment.length > 0 && equipment[0].deviceId === item.deviceId" class="device-selected">
									✓ 已选择
								</view>
							</view>
						</view>
						<view class="device-info">
							<view class="device-id">
								<text class="info-label">设备ID:</text>
								<text class="info-value">{{ item.deviceId }}</text>
							</view>
							<view class="device-services" v-if="item.advertisServiceUUIDs && item.advertisServiceUUIDs.length > 0">
								<text class="info-label">广播服务:</text>
								<text class="info-value">{{ item.advertisServiceUUIDs.length }}个</text>
							</view>
							<view class="device-manufacturer" v-if="item.manufacturerData">
								<text class="info-label">制造商数据:</text>
								<text class="info-value">{{ item.manufacturerData.length }}字节</text>
							</view>
						</view>
					</view>
					<view v-if="showMaskType === 'service'">
						<view class="uni-list_item" style="line-height:2.2;">
							UUID: {{ item.uuid }}
							<text v-if="showMaskType === 'service'">
								{{ item.isPrimary ? '（主服务）' : '' }}
							</text>
						</view>
					</view>
					<view v-if="showMaskType === 'characteristics'">
						<view class="uni-list_name">uuid:{{ item.uuid }}</view>
						<view class="uni-list_item">是否支持 read 操作:{{ item.properties.read }}</view>
						<view class="uni-list_item">
							是否支持 write 操作:{{ item.properties.write }}
						</view>
						<view class="uni-list_item">
							是否支持 notify 操作:{{ item.properties.notify }}
						</view>
						<view class="uni-list_item">
							是否支持 indicate 操作:{{ item.properties.indicate }}
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			title: 'bluetooth',
			disabled: [false, true, true, true, true, true, true, true, true, true, true],
			newDeviceLoad: false,
			searchLoad: false,
			maskShow: false,
			equipment: [],
			adapterState: {
				discovering: false,
				available: false
			},
			connected: false,
			showMaskType: 'device',
			servicesData: [],
			characteristicsData: [],
			valueChangeData: {},
			isStop:true ,
			list: []
		};
	},
	onLoad() {
		this.onBLEConnectionStateChange();
	},
	methods: {
		moveHandle() {},
		/**
		 * 根据RSSI值返回信号强度样式类
		 */
		getRSSIClass(rssi) {
			if (rssi >= -50) return 'rssi-excellent';
			if (rssi >= -70) return 'rssi-good';
			if (rssi >= -85) return 'rssi-fair';
			return 'rssi-poor';
		},
		/**
		 * 关闭遮罩
		 */
		maskclose(){
			this.maskShow = false;
		},
		/**
		 * 选择设备
		 */
		queryDevices() {
			// this.newDeviceLoad = true;
			this.showMaskType = 'device';
			this.maskShow = true;
		},
		tapQuery(item) {
			if (this.showMaskType === 'device') {
				this.$set(this.disabled, 4, false);
				if (this.equipment.length > 0) {
					this.equipment[0] = item;
				} else {
					this.equipment.push(item);
				}
				this.newDeviceLoad = false;
			}
			if (this.showMaskType === 'service') {
				this.$set(this.disabled, 6, false);
				if (this.servicesData.length > 0) {
					this.servicesData[0] = item;
				} else {
					this.servicesData.push(item);
				}
			}
			if (this.showMaskType === 'characteristics') {
				this.$set(this.disabled, 7, false);
				if (this.characteristicsData.length > 0) {
					this.characteristicsData[0] = item;
				} else {
					this.characteristicsData.push(item);
				}
			}
			this.maskShow = false;
		},
		/**
		 * 初始化蓝牙设备
		 */
		openBluetoothAdapter() {
			uni.openBluetoothAdapter({
				success: e => {
					console.log('初始化蓝牙成功:' + e.errMsg);
					console.log(JSON.stringify(e));
					this.isStop = false ;
					this.$set(this.disabled, 0, true);
					this.$set(this.disabled, 1, false);
					this.$set(this.disabled, 10, false);
					this.getBluetoothAdapterState();
				},
				fail: e => {
					console.log(e)
					console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
					if (e.errCode !== 0) {
						initTypes(e.errCode,e.errMsg);
					}
				}
			});
		},
		/**
		 * 开始搜索蓝牙设备
		 */
		startBluetoothDevicesDiscovery() {
			uni.startBluetoothDevicesDiscovery({
				success: e => {
					console.log('开始搜索蓝牙设备:' + e.errMsg);
					this.searchLoad = true;
					this.$set(this.disabled, 1, true);
					this.$set(this.disabled, 2, false);
					this.$set(this.disabled, 3, false);
					this.onBluetoothDeviceFound();
				},
				fail: e => {
					console.log('搜索蓝牙设备失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 停止搜索蓝牙设备
		 */
		stopBluetoothDevicesDiscovery(types) {
			uni.stopBluetoothDevicesDiscovery({
				success: e => {
					console.log('停止搜索蓝牙设备:' + e.errMsg);
					if (types) {
						this.$set(this.disabled, 1, true);
					} else {
						this.$set(this.disabled, 1, false);
					}
					this.$set(this.disabled, 2, true);
					// this.$set(this.disabled, 3, true);
					this.searchLoad = false;
				},
				fail: e => {
					console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 发现外围设备
		 */
		onBluetoothDeviceFound() {
			uni.onBluetoothDeviceFound(devices => {
				console.log('开始监听寻找到新设备的事件');
				// this.$set(this.disabled, 3, false);
				this.getBluetoothDevices();
			});
		},
		/**
		 * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
		 */
		getBluetoothDevices() {
			uni.getBluetoothDevices({
				success: res => {
					this.newDeviceLoad = false;
					console.log('获取蓝牙设备成功:' + res.errMsg);
					// console.log(JSON.stringify(res))
					this.list = this.processDeviceList(res.devices);
				},
				fail: e => {
					console.log('获取蓝牙设备错误，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 处理设备列表：去重、排序、格式化
		 */
		processDeviceList(devices) {
			// 去重：根据deviceId去重
			const uniqueDevices = [];
			const deviceIds = new Set();
			
			devices.forEach(device => {
				if (!deviceIds.has(device.deviceId)) {
					deviceIds.add(device.deviceId);
					// 格式化设备信息
					const processedDevice = {
						...device,
						name: device.name || device.localName || '未知设备',
						RSSI: device.RSSI || -100, // 默认RSSI值
						advertisServiceUUIDs: device.advertisServiceUUIDs || [],
						manufacturerData: device.manufacturerData || null
					};
					uniqueDevices.push(processedDevice);
				}
			});
			
			// 按RSSI信号强度排序（信号强的在前）
			uniqueDevices.sort((a, b) => b.RSSI - a.RSSI);
			
			return uniqueDevices;
		},
		/**
		 * 获取本机蓝牙适配器状态
		 */
		getBluetoothAdapterState() {
			console.log('--->');
			uni.getBluetoothAdapterState({
				success: res => {
					console.log(JSON.stringify(res));
					this.adapterState = res;
				},
				fail: e => {
					console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 连接低功耗蓝牙
		 */
		createBLEConnection() {
			let deviceId = this.equipment[0].deviceId;
			uni.showToast({
				title: '连接蓝牙...',
				icon: 'loading',
				duration: 99999
			});
			uni.createBLEConnection({
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId,
				success: res => {
					console.log(res);
					console.log('连接蓝牙成功:' + res.errMsg);
					// 连接设备后断开搜索 并且不能搜索设备
					this.stopBluetoothDevicesDiscovery(true);
					uni.hideToast();
					uni.showToast({
						title: '连接成功',
						icon: 'success',
						duration: 2000
					});
					this.$set(this.disabled, 3, true);
					this.$set(this.disabled, 4, true);
					this.$set(this.disabled, 5, false);
					this.$set(this.disabled, 9, false);
					this.connected = true;
				},
				fail: e => {
					console.log('连接低功耗蓝牙失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 断开与低功耗蓝牙设备的连接
		 */
		closeBLEConnection() {
			let deviceId = this.equipment[0].deviceId;
			uni.closeBLEConnection({
				deviceId,
				success: res => {
					console.log(res);
					console.log('断开低功耗蓝牙成功:' + res.errMsg);
					this.$set(this.disabled, 1, false);
					this.$set(this.disabled, 3, true);
					this.$set(this.disabled, 4, true);
					this.$set(this.disabled, 5, true);
					this.$set(this.disabled, 6, true);
					this.$set(this.disabled, 7, true);
					this.$set(this.disabled, 8, true);
					this.$set(this.disabled, 9, true);
					this.equipment = [];
					this.servicesData = [];
					this.characteristicsData = [];
				},
				fail: e => {
					console.log('断开低功耗蓝牙成功，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 获取所有服务
		 */
		getBLEDeviceServices() {
			let deviceId = this.equipment[0].deviceId;
			console.log('获取所有服务的 uuid:' + deviceId);

			uni.getBLEDeviceServices({
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId,
				success: res => {
					console.log(JSON.stringify(res.services));
					console.log('获取设备服务成功:' + res.errMsg);
					this.$set(this.disabled, 7, true);
					this.$set(this.disabled, 8, true);
					this.showMaskType = 'service';
					this.list = res.services;

					this.characteristicsData = [];
					if (this.list.length <= 0) {
						toast('获取服务失败，请重试!');
						return;
					}
					this.maskShow = true;
				},
				fail: e => {
					console.log('获取设备服务失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 获取某个服务下的所有特征值
		 */
		getBLEDeviceCharacteristics() {
			let deviceId = this.equipment[0].deviceId;
			let serviceId = this.servicesData[0].uuid;
			console.log(deviceId);
			console.log(serviceId);
			uni.getBLEDeviceCharacteristics({
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId,
				// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				serviceId,
				success: res => {
					console.log(JSON.stringify(res));
					console.log('获取特征值成功:' + res.errMsg);
					this.$set(this.disabled, 7, true);
					this.valueChangeData = {};
					this.showMaskType = 'characteristics';
					this.list = res.characteristics;
					if (this.list.length <= 0) {
						toast('获取特征值失败，请重试!');
						return;
					}
					this.maskShow = true;
				},
				fail: e => {
					console.log('获取特征值失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
		},
		/**
		 * 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
		 */
		onBLEConnectionStateChange() {
			uni.onBLEConnectionStateChange(res => {
				// 该方法回调中可以用于处理连接意外断开等异常情况
				console.log(`蓝牙连接状态 -------------------------->`);
				console.log(JSON.stringify(res));
				if (!res.connected) {
					if(this.isStop) return ;
					console.log('断开低功耗蓝牙成功:');
					this.$set(this.disabled, 1, false);
					this.$set(this.disabled, 3, true);
					this.$set(this.disabled, 4, true);
					this.$set(this.disabled, 5, true);
					this.$set(this.disabled, 6, true);
					this.$set(this.disabled, 7, true);
					this.$set(this.disabled, 8, true);
					this.$set(this.disabled, 9, true);
					this.searchLoad = false;
					this.equipment = [];
					this.servicesData = [];
					this.characteristicsData = [];
					this.valueChangeData = {};
					toast('已经断开当前蓝牙连接');
				}
			});
		},
		/**
		 * 读取低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持 read 才可以成功调用
		 */
		readBLECharacteristicValue() {
			let deviceId = this.equipment[0].deviceId;
			let serviceId = this.servicesData[0].uuid;
			let characteristicId = this.characteristicsData[0].uuid;
			console.log(deviceId);
			console.log(serviceId);
			console.log(characteristicId);
			uni.readBLECharacteristicValue({
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId,
				// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				serviceId,
				// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
				characteristicId,
				success: res => {
					console.log('读取设备数据值成功');
					console.log(JSON.stringify(res));
					this.notifyBLECharacteristicValueChange();
				},
				fail(e) {
					console.log('读取设备数据值失败，错误码：' + e.errCode);
					if (e.errCode !== 0) {
						initTypes(e.errCode);
					}
				}
			});
			this.onBLECharacteristicValueChange();
		},
		/**
		 * 监听低功耗蓝牙设备的特征值变化事件。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
		 */
		onBLECharacteristicValueChange() {
			// 必须在这里的回调才能获取
			uni.onBLECharacteristicValueChange(characteristic => {
				console.log('监听低功耗蓝牙设备的特征值变化事件成功');
				console.log(JSON.stringify(characteristic));
				this.valueChangeData = characteristic;
			});
		},
		/**
		 * 订阅操作成功后需要设备主动更新特征值的 value，才会触发 uni.onBLECharacteristicValueChange 回调。
		 */
		notifyBLECharacteristicValueChange() {
			let deviceId = this.equipment[0].deviceId;
			let serviceId = this.servicesData[0].uuid;
			let characteristicId = this.characteristicsData[0].uuid;
			let notify = this.characteristicsData[0].properties.notify;
			console.log(deviceId);
			console.log(serviceId);
			console.log(characteristicId);
			console.log(notify);
			uni.notifyBLECharacteristicValueChange({
				state: true, // 启用 notify 功能
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId,
				// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				serviceId,
				// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
				characteristicId,
				success(res) {
					console.log('notifyBLECharacteristicValueChange success:' + res.errMsg);
					console.log(JSON.stringify(res));
				}
			});
		},
		/**
		 * 	断开蓝牙模块
		 */
		closeBluetoothAdapter(OBJECT) {
			uni.closeBluetoothAdapter({
				success: res => {
					console.log('断开蓝牙模块成功');
					this.isStop = true ;
					this.$set(this.disabled, 0, false);
					this.$set(this.disabled, 1, true);
					this.$set(this.disabled, 2, true);
					this.$set(this.disabled, 3, true);
					this.$set(this.disabled, 4, true);
					this.$set(this.disabled, 5, true);
					this.$set(this.disabled, 6, true);
					this.$set(this.disabled, 7, true);
					this.$set(this.disabled, 8, true);
					this.$set(this.disabled, 9, true);
					this.$set(this.disabled, 10, true);
					this.equipment = [];
					this.servicesData = [];
					this.characteristicsData = [];
					this.valueChangeData = {};
					this.adapterState = [];
					this.searchLoad =false;
					toast('断开蓝牙模块');
				}
			});
		}
	}
};

/**
 * 判断初始化蓝牙状态
 */
function initTypes(code, errMsg) {
	switch (code) {
		case 10000:
			toast('未初始化蓝牙适配器');
			break;
		case 10001:
			toast('未检测到蓝牙，请打开蓝牙重试！');
			break;
		case 10002:
			toast('没有找到指定设备');
			break;
		case 10003:
			toast('连接失败');
			break;
		case 10004:
			toast('没有找到指定服务');
			break;
		case 10005:
			toast('没有找到指定特征值');
			break;
		case 10006:
			toast('当前连接已断开');
			break;
		case 10007:
			toast('当前特征值不支持此操作');
			break;
		case 10008:
			toast('其余所有系统上报的异常');
			break;
		case 10009:
			toast('Android 系统特有，系统版本低于 4.3 不支持 BLE');
			break;
		default:
			toast(errMsg);
	}
}

/**
 * 弹出框封装
 */
function toast(content, showCancel = false) {
	uni.showModal({
		title: '提示',
		content,
		showCancel
	});
}
</script>

<style>

.uni-title {
	/* width: 100%; */
	/* height: 80rpx; */
	text-align: center;
}

.uni-mask {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	width: 100%;
	background: rgba(0, 0, 0, 0.6);
	padding: 0 30rpx;
	box-sizing: border-box;
}

.uni-scroll_box {
	height: 70%;
	background: #fff;
	border-radius: 20rpx;
}
.uni-list-box {
	margin: 0 20rpx;
	padding: 15rpx 0;
	border-bottom: 1px #f5f5f5 solid;
	box-sizing: border-box;
}
.uni-list:last-child {
	border: none;
}
.uni-list_name {
	font-size: 30rpx;
	color: #333;
}
.uni-list_item {
	font-size: 24rpx;
	color: #555;
	line-height: 1.5;
}

/* 设备信息卡片样式 */
.device-info-card {
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	border-radius: 8rpx;
	padding: 20rpx;
	margin: 20rpx 0;
}

.device-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #007AFF;
	margin-bottom: 15rpx;
}

.device-details {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.device-name, .device-id, .device-rssi, .device-services {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.label {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
}

.value {
	font-size: 26rpx;
	color: #333;
	font-family: monospace;
}

/* 设备列表项样式 */
.device-item {
	border: 1px solid #e9ecef;
	border-radius: 8rpx;
	margin: 10rpx 20rpx;
	padding: 20rpx;
	background: #fff;
	box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.device-item:active {
	background: #f8f9fa;
	transform: scale(0.98);
}

.device-item-content {
	width: 100%;
}

.device-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.device-status {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4rpx;
}

.device-selected {
	font-size: 20rpx;
	color: #28a745;
	font-weight: bold;
	background: #d4edda;
	padding: 2rpx 8rpx;
	border-radius: 8rpx;
}

.device-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
}

.device-rssi {
	font-size: 24rpx;
	font-weight: bold;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	color: #fff;
}

.rssi-excellent {
	background: #28a745;
}

.rssi-good {
	background: #17a2b8;
}

.rssi-fair {
	background: #ffc107;
	color: #333;
}

.rssi-poor {
	background: #dc3545;
}

.device-info {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.device-id, .device-services, .device-manufacturer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.info-label {
	font-size: 24rpx;
	color: #666;
}

.info-value {
	font-size: 24rpx;
	color: #333;
	font-family: monospace;
	word-break: break-all;
	text-align: right;
	max-width: 60%;
}

/* 搜索状态样式 */
.search-status {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.searching {
	color: #007AFF;
	animation: pulse 1.5s infinite;
}

.search-tip {
	font-size: 24rpx;
	color: #666;
	font-style: italic;
}

@keyframes pulse {
	0% { opacity: 1; }
	50% { opacity: 0.5; }
	100% { opacity: 1; }
}

.uni-success_box {
	position: absolute;
	left: 0;
	bottom: 0;
	min-height: 100rpx;
	width: 100%;
	background: #fff;
	box-sizing: border-box;
	border-top: 1px #eee solid;
}
.uni-success_sub {
	/* width: 100%%; */
	height: 100rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30rpx;
}
.uni-close_button {
	padding: 0 20rpx;
	height: 60rpx;
	line-height: 60rpx;
	background: #ce3c39;
	color: #ffffff;
	border-radius: 10rpx;
}
.uni-success_content {
	height: 600rpx;
	margin: 30rpx;
	margin-top: 0;
	border: 1px #eee solid;
	padding: 30rpx;
}
.uni-content_list {
	padding-bottom: 10rpx;
	border-bottom: 1px #f5f5f5 solid;
}
.uni-tips {
	text-align: center;
	font-size: 24rpx;
	color: #666;
}
</style>
