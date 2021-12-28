class PhysicsWorld{
  G = 6.67e-11
  objects = []

  gravity_force(m1, m2, r){
    return p5.Vector.normalize(r).mult(this.G*m1*m2/(r.magSq()))
  }

  addObject(obj){
    this.objects.push(obj)
    obj.world = this
  }
  removeAllObjects(){
    this.objects = []
  }

  drawLinesBetweenObjects(){
    let prevObj, firstObj

    for(let obj of this.objects){
      if(!prevObj){
        prevObj = obj
        firstObj = obj
      } else {
        line(prevObj.pos.x, prevObj.pos.y, obj.pos.x, obj.pos.y);
        prevObj = obj
      }
    }
    line(prevObj.pos.x, prevObj.pos.y, firstObj.pos.x, firstObj.pos.y);
  }

  render(){
    for(let obj of this.objects){
      obj.update(deltaTime)
    }
  }
}

class PhysicsObject{
  constructor(name, pos, radius, shape, mass, velocity, fixed){
    pos.add(windowWidth / 2, windowHeight / 2, 0) // put them in the center
	  this.name = name
    this.pos = pos || createVector(0,0,0)
    this.radius = radius || 1
    this.shape = shape
    this.mass = mass || 1
    this.vel = velocity
    this.acc = createVector(0,0,0)
    this.net_force = createVector(0,0,0)
    this.fixed = fixed || false
  }
  getPos(){
    return p5.Vector.sub(this.pos, createVector(windowWidth / 2, windowHeight / 2, 0))
  }
  calculate_forces(){
    let f = createVector(0,0,0)
    const others = this.world.objects.filter(obj => obj.name !== this.name)
    for(let obj of others){
      let force = this.world.gravity_force(this.mass, obj.mass, distance_vector(this, obj))
      f.add(force)
    }
    this.net_force = f
  }
  update_acceleration(dt){
    this.acc = p5.Vector.mult(this.net_force, this.mass)
  }
  update_velocity(dt){
    this.vel.add(p5.Vector.mult(this.acc, dt))
  }
  update_pos(dt){
    this.pos.add(p5.Vector.mult(this.vel, dt))
  }
  add_velocity(velocity){
    this.vel = velocity
  }
  update(dt){
    if(this.fixed !== true){
      this.calculate_forces()
      this.update_acceleration(dt)
      this.update_velocity(dt)
      this.update_pos(dt)
    }

    this.shape(this.pos.x, this.pos.y, this.radius)
  }
  
}

const distance_vector = (obj1, obj2) => {
  return p5.Vector.sub(obj2.pos, obj1.pos)
}

function buildPolygon(r, n){
  const phi = 360 / n
  const m_i = mass / (n-1)

  for(let i = 0; i <= n-1; i++){
    const xPos = r * cos(phi*i)
    const yPos = r * sin(phi*i)

    const po =new PhysicsObject(`vertex${i}`, createVector(xPos, yPos, 0), 10, circle, m_i, createVector(0,0,0))
    WORLD.addObject(po)
  }
}
var mass = 6e3
let slider;
var WORLD;
var sliderValue = 0;

function setOrbitalVelocities(r){

  for(let obj of WORLD.objects){
    obj.calculate_forces()
    const velocity_magnitude = sqrt(obj.net_force.mag() * r / obj.mass)

    const v0 = obj.getPos().copy()
    v0.normalize()
    v0.rotate(90)
    v0.mult(velocity_magnitude)
    obj.add_velocity(v0)
  }
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textSize(32);
  strokeWeight(2)
  WORLD = new PhysicsWorld()
  slider = createSlider(1, 500, 6, 1);
  slider.position(50, 10);
  slider.style('width', '500px');

}

var r = 300

function draw() {
  background(220);
  let newSliderValue = slider.value();
  text(`${newSliderValue}`, 10, 30);

  if(newSliderValue != sliderValue){
    WORLD.removeAllObjects()
    sliderValue = newSliderValue
    buildPolygon(r, sliderValue)
    setOrbitalVelocities(r)
  }
  
  // reference circle
  fill(220)
  stroke(color(255, 204, 0))
  circle(windowWidth / 2, windowHeight / 2, r * 2)

  stroke(0)
  fill(0)

  WORLD.render()
  WORLD.drawLinesBetweenObjects()
}

