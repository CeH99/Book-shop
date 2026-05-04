const EventEmitter = require('events');

class EventBroker extends EventEmitter {}
const broker = new EventBroker();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FleetService {
    constructor(eventBroker) {
        eventBroker.on('RideStartedEvent', this.handleRideStarted.bind(this));
    }
    async handleRideStarted(data) {
        await sleep(500);
        console.log(`[Служба автопарку] Сигнал надіслано: Двері автомобіля ${data.carId} РОЗБЛОКОВАНО.`);
    }
}

class PaymentService {
    constructor(eventBroker) {
        eventBroker.on('RideStartedEvent', this.handleRideStarted.bind(this));
    }
    async handleRideStarted(data) {
        await sleep(1000);
        console.log(`[Служба оплати] Депозит у розмірі 100 грн заморожено для користувача ${data.userId}.`);
    }
}

class NotificationService {
    constructor(eventBroker) {
        eventBroker.on('RideStartedEvent', this.handleRideStarted.bind(this));
    }
    async handleRideStarted(data) {
        await sleep(200);
        console.log(`[Служба сповіщень] Push-повідомлення: 'Ваша поїздка розпочалася! Гарної подорожі, користувачу ${data.userId}'.`);
    }
}

class RideService {
    constructor(eventBroker) {
        this.broker = eventBroker;
    }
    async startRide(userId, carId) {
        const rideId = 101;
        console.log(`[Служба поїздок] Створено запис про поїздку #${rideId} у базі даних.`);
        console.log(`\n[BROKER] Публікація події: RideStartedEvent`);
        this.broker.emit('RideStartedEvent', { rideId, userId, carId });
    }
}

async function main() {
    const fleetService = new FleetService(broker);
    const paymentService = new PaymentService(broker);
    const notificationService = new NotificationService(broker);
    const rideService = new RideService(broker);

    console.log("КЛІЄНТ: Натискає кнопку 'Почати оренду' в додатку...\n");
    await rideService.startRide("U-777", "AA1234BB");
}

main();
