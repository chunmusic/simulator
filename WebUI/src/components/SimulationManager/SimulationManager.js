import React from 'react'
import FormModal from '../Modal/FormModal';
import PageHeader from '../PageHeader/PageHeader';
import Checkbox from '../Checkbox/Checkbox';
import SingleSelect from '../Select/SingleSelect';
import MultiSelect from '../Select/MultiSelect';
import SimulationPlayer from '../Player/Player';
import { FaRegEdit, FaRegWindowClose } from 'react-icons/fa';
import css from './SimulationManager.module.less';
import appCss from '../../App/App.module.less';
import {getList, getItem, deleteItem, postItem, editItem} from '../../APIs'
import axios from 'axios';
import classNames from 'classnames';
class SimulationManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            simulations: [],
            data: {
                id: '',
                name: null,
                map: null,
                vehicles: [],
                apiOnly: false,
                interactive: false,
                offScreen: false,
                cluster: 0,
                timeOfDay: null,
                rain: 0,
                fog: 0,
                wetness: 0,
                cloudiness: 0
            }
        }
    }

    componentDidMount() {
        getList('simulations').then(data => {
            const simulations = new Map(data.map(d => [d.id, d]));
            this.setState({simulations});
        });
    }

    getSelectOptions() {
        getList('maps').then(data => this.setState({mapList: data}));
        getList('vehicles').then(data => this.setState({vehicleList: data}));
        getList('clusters').then(data => this.setState({clusterList: data}));
    }

    openAddMewModal = () => {
        this.getSelectOptions();
        this.setState({modalOpen: true, method: 'POST'});
    }

    openEdit = (ev) => {
        const id = ev.currentTarget.dataset.simulationid;
        getItem('simulations', id).then(data => {
            console.log('openEdit',data)
            const {name, map, vehicles, apiOnly, interactive, offScreen, cluster, timeOfDay, weather} = data;
            const {rain, fog, wetness, cloudiness} = weather;
            this.setState({
                modalOpen: true,
                id,
                name,
                map,
                vehicles,
                apiOnly,
                interactive,
                offScreen,
                cluster,
                timeOfDay,
                rain,
                fog,
                wetness,
                cloudiness,
                method: 'PUT'
            })
        });
        this.getSelectOptions();
    }

    handleDelete = (ev) => {
        const id = ev.currentTarget.dataset.simulationid;
        deleteItem('simulations', id).then(({responseStatus}) => {
            if (responseStatus === 'success') {
                this.setState(prevState => {
                    prevState.simulations.delete(parseInt(id));
                    return {modalOpen: false, data: prevState.simulations}
                });
            }
        });
    }

    handleInputChange = (ev) => {
        const target = ev.target;
        let value;
        if (target.type === 'checkbox') value = target.checked;
        else if (target.type === 'text' || target.type === 'number') value = target.value;
        console.log(value, target)
        this.setState({[target.name]: value});
    }

    handleSelectInputChange = ev => {
        const target = ev.target;
        console.log(target)
        this.setState({[target.dataset.for]: parseInt(target.value)}, () => console.log(this.state))
    }

    handleMultiSelectInputChange = ev => {
        const target = ev.target;
        this.setState({[target.dataset.for]: [...target.options].filter(o => o.selected).map(o => parseInt(o.value))}, () => console.log(this.state))
    }

    onModalClose = (action) => {
        const {id, name, map, vehicles, apiOnly, interactive, offScreen, cluster, timeOfDay, rain, fog, wetness, cloudiness} = this.state;
        const simData = {
            name,
            map,
            vehicles,
            apiOnly,
            interactive,
            offScreen,
            cluster,
            timeOfDay,
            weather: {
                rain,
                fog,
                wetness,
                cloudiness
            }
        }
        if (action === 'save') {
            if (this.state.method === 'POST') {
                postItem('simulations', simData).then(newMap => {
                    if (newMap.responseStatus === 'error') {
                        this.setState({warning: newMap.error});
                    } else {
                        this.setState(prevState => ({modalOpen: false, data: prevState.simulations.set(newMap.id, newMap)}));
                    }
                })
            } else if (this.state.method === 'PUT') {
                editItem('simulations', id, simData).then(newMap => {
                    if (newMap.responseStatus === 'error') {
                        this.setState({warning: newMap.error});
                    } else {
                        this.setState(prevState => {
                            prevState.simulations.set(newMap.id,newMap);
                            return {modalOpen: false, simulations: prevState.simulations};
                        });
                    }
                })
            }
        } else if (action === 'cancel') {
            this.setState({modalOpen: false, method: null});
        }
    }

    selectSimulation = (ev) => {
        const id = parseInt(ev.currentTarget.dataset.simulationid);
        this.setState(prevState => {
            if (prevState.selectedSimulation === id) {
                return {selectedSimulation: null};
            } else {
                return {selectedSimulation: id};
            }
        });
    }

    startSimulation = (ev) =>{
        const id = this.state.selectedSimulation;
        axios.post(`http://localhost:8079/simulations/${id}/start`).then(res => {
            // debugger
        })

    }

    simulationList = () => {
        const list = [];
        for (const [i, simulation] of this.state.simulations) {
            const classes = classNames(css.simulationItem, {[css.selected]: this.state.selectedSimulation === i});
            list.push(
                <tr key={`${simulation}-${i}`} className={classes} data-simulationid={i} onClick={this.selectSimulation}>
                    <td>{simulation.name}</td>
                    <td data-simulationid={simulation.id} onClick={this.openEdit}><FaRegEdit /></td>
                    <td data-simulationid={simulation.id} onClick={this.handleDelete}><FaRegWindowClose /></td>
                </tr>
            )
        }
        return list;
    }

    render() {
        const {...rest} = this.props;
        const {modalOpen, simulations, mapList, clusterList, vehicleList, method, playing, warning, selectedSimulation,
            name, map, vehicles, apiOnly, interactive, offScreen, cluster, timeOfDay, rain, fog, wetness, cloudiness} = this.state;
// if (simulations) {console.log(simulations); debugger}
        return (
            <div className={css.simulationManager} {...rest}>
                <PageHeader title='Simulation Manager'>
                    <button onClick={this.openAddMewModal}>Add new</button>
                </PageHeader>
                <table>
                    <tbody>{simulations && this.simulationList()}</tbody>
                </table>
                { selectedSimulation && <SimulationPlayer open={!!this.selectSimulation} title={simulations.get(selectedSimulation).name} handlePlay={this.startSimulation} />}
                { modalOpen &&
                    <FormModal onModalClose={this.onModalClose} title={method === 'PUT' ? 'Edit' : 'Add a new Simulation'}>
                        <input
                            required
                            name="name"
                            type="text"
                            defaultValue={name}
                            placeholder="name"
                            onChange={this.handleInputChange} />
                        <Checkbox checked={apiOnly} label="API Only" name={'apiOnly'} onChange={this.handleInputChange} disabled={interactive}/>
                        <SingleSelect data-for='cluster' defaultValue={cluster} onChange={this.handleSelectInputChange} options={clusterList} label="name" value="id" />
                        <SingleSelect data-for='map' defaultValue={map} onChange={this.handleSelectInputChange} placeholder={'Select a map'} options={mapList} label="name" value="id" disabled={apiOnly} />
                        {vehicleList && <MultiSelect data-for='vehicles' size={vehicleList.length} defaultValue={vehicles} onChange={this.handleMultiSelectInputChange} options={vehicleList} label="name" value="id" disabled={apiOnly} />}
                        <Checkbox checked={interactive} label="Interactive"  name={'interactive'} disabled={apiOnly || offScreen} onChange={this.handleInputChange} />
                        <Checkbox checked={offScreen} label="Off-screen Rendering"  name={'offScreen'} disabled={interactive} onChange={this.handleInputChange} />
                        <br />
                        <label className={appCss.inputLabel}>Time of day</label><br />
                        <input name="weather" type="text" value={timeOfDay || new Date()} onChange={this.handleInputChange} />
                        <br />
                        <label className={appCss.inputLabel}>Weather</label><br />
                        <label className={appCss.inputLabel}>min: 0, max: 1.0</label>
                        <input type="number" name="cloudiness" value={cloudiness} onChange={this.handleInputChange} step="0.01" placeholder="cloudiness"/>
                        <input type="number" name="rain" value={rain} onChange={this.handleInputChange} step="0.01" placeholder="rain"/>
                        <input type="number" name="wetness" value={wetness} onChange={this.handleInputChange} step="0.01" placeholder="wetness"/>
                        <input type="number" name="fog" value={fog} onChange={this.handleInputChange} step="0.01" placeholder="fog"/>
                        <span className={appCss.warning}>{warning}</span>
                    </FormModal>
                }
            </div>
        )
    }
};

export default SimulationManager;
