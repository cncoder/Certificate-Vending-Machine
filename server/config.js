var config = {};

config.aws = {};

//config.ak =  '';
//config.sk = '';s
config.region = 'us-east-1';

config.thingName = 'RobotArm_Thing';
config.policyName = 'RobotArm_Thing';
config.thing = 'arn:aws:iot:us-east-1:432423432423423:thing/Switch_Thing';
config.policy = 'arn:aws:iot:us-east-1:432432423:policy/RobotArm_Thing';

module.exports = config;